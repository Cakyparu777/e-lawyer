from fastapi import APIRouter, HTTPException
from sqlalchemy import desc, or_, select

from app.api.deps import CurrentUser, DbSession
from app.core.config import settings
from app.db.models import Appointment, ChatMessage, ChatThread, Payment, PaymentStatus, User
from app.schemas import AgoraRtmTokenOut, AppointmentOut, ChatMessageCreate, ChatMessageOut, ChatThreadOut, ChatThreadSummary
from app.services.agora_tokens import agora_token_service
from app.services.chat import chat_service

router = APIRouter(prefix="/chats", tags=["chats"])


def _ensure_participant(thread: ChatThread, user: User) -> None:
    if user.id not in {thread.client_id, thread.lawyer_id}:
        raise HTTPException(status_code=403, detail="Энэ чатыг нээх эрхгүй байна")


def _ensure_paid_chat(db: DbSession, appointment: Appointment) -> None:
    payment = db.get(Payment, appointment.payment_id) if appointment.payment_id else None
    if not payment or payment.status != PaymentStatus.SUCCEEDED:
        raise HTTPException(status_code=403, detail="Төлбөр баталгаажаагүй тул чат нээгдэхгүй")


def _contact_snapshot(user: User) -> dict[str, str]:
    return {"username": user.username, "email": user.email, "phoneNumber": user.phone_number}


def _build_thread_out(db: DbSession, thread: ChatThread) -> ChatThreadOut:
    appointment = db.get(Appointment, thread.appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Захиалга олдсонгүй")
    lawyer = db.get(User, thread.lawyer_id)
    client = db.get(User, thread.client_id)
    if not lawyer or not client:
        raise HTTPException(status_code=404, detail="Чатын оролцогч олдсонгүй")

    messages = db.scalars(
        select(ChatMessage).where(ChatMessage.thread_id == thread.id).order_by(ChatMessage.created_at.asc())
    ).all()
    return ChatThreadOut(
        id=thread.id,
        appointment_id=thread.appointment_id,
        client_id=thread.client_id,
        lawyer_id=thread.lawyer_id,
        agora_channel_id=thread.agora_channel_id,
        created_at=thread.created_at,
        last_message_at=thread.last_message_at,
        lawyer_contact_snapshot=_contact_snapshot(lawyer),
        client_contact_snapshot=appointment.client_contact_snapshot or _contact_snapshot(client),
        messages=[ChatMessageOut.model_validate(item) for item in messages],
    )


@router.get("", response_model=list[ChatThreadSummary])
def list_chat_threads(db: DbSession, current_user: CurrentUser) -> list[ChatThreadSummary]:
    appointment_stmt = select(Appointment).where(
        or_(Appointment.client_id == current_user.id, Appointment.lawyer_id == current_user.id)
    )
    for appointment in db.scalars(appointment_stmt).all():
        payment = db.get(Payment, appointment.payment_id) if appointment.payment_id else None
        if payment and payment.status == PaymentStatus.SUCCEEDED:
            chat_service.ensure_thread_for_paid_appointment(db, appointment)
    db.commit()

    threads = db.scalars(
        select(ChatThread)
        .where(or_(ChatThread.client_id == current_user.id, ChatThread.lawyer_id == current_user.id))
        .order_by(desc(ChatThread.last_message_at))
    ).all()
    summaries: list[ChatThreadSummary] = []
    for thread in threads:
        appointment = db.get(Appointment, thread.appointment_id)
        if not appointment:
            continue
        lawyer = db.get(User, thread.lawyer_id)
        client = db.get(User, thread.client_id)
        if not lawyer or not client:
            continue
        latest = db.scalar(
            select(ChatMessage).where(ChatMessage.thread_id == thread.id).order_by(desc(ChatMessage.created_at))
        )
        summaries.append(
            ChatThreadSummary(
                id=thread.id,
                appointment_id=thread.appointment_id,
                client_id=thread.client_id,
                lawyer_id=thread.lawyer_id,
                agora_channel_id=thread.agora_channel_id,
                last_message_at=thread.last_message_at,
                latest_message=ChatMessageOut.model_validate(latest) if latest else None,
                lawyer_contact_snapshot=_contact_snapshot(lawyer),
                client_contact_snapshot=appointment.client_contact_snapshot or _contact_snapshot(client),
                appointment=AppointmentOut.model_validate(appointment),
            )
        )
    return summaries


@router.get("/appointments/{appointment_id}", response_model=ChatThreadOut)
def get_thread_for_appointment(appointment_id: str, db: DbSession, current_user: CurrentUser) -> ChatThreadOut:
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Захиалга олдсонгүй")
    if current_user.id not in {appointment.client_id, appointment.lawyer_id}:
        raise HTTPException(status_code=403, detail="Энэ захиалгын чатыг нээх эрхгүй байна")
    _ensure_paid_chat(db, appointment)
    thread = chat_service.ensure_thread_for_paid_appointment(db, appointment)
    db.commit()
    db.refresh(thread)
    return _build_thread_out(db, thread)


@router.get("/appointments/{appointment_id}/rtm-token", response_model=AgoraRtmTokenOut)
def get_rtm_token_for_appointment(
    appointment_id: str,
    db: DbSession,
    current_user: CurrentUser,
) -> AgoraRtmTokenOut:
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Захиалга олдсонгүй")
    if current_user.id not in {appointment.client_id, appointment.lawyer_id}:
        raise HTTPException(status_code=403, detail="Энэ захиалгын RTM token авах эрхгүй байна")
    _ensure_paid_chat(db, appointment)
    thread = chat_service.ensure_thread_for_paid_appointment(db, appointment)
    db.commit()
    channel_name = thread.agora_channel_id or f"appointment_{appointment.id}"
    try:
        token = agora_token_service.build_rtm_token(channel_name, current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    if not settings.agora_app_id:
        raise HTTPException(status_code=500, detail="Agora App ID тохируулагдаагүй байна")
    return AgoraRtmTokenOut(
        app_id=settings.agora_app_id,
        channel_name=channel_name,
        user_id=current_user.id,
        token=token,
        expires_in=settings.agora_rtm_token_expire_seconds,
    )


@router.post("/{thread_id}/messages", response_model=ChatMessageOut)
def send_message(
    thread_id: str,
    payload: ChatMessageCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> ChatMessage:
    thread = db.get(ChatThread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Чат олдсонгүй")
    _ensure_participant(thread, current_user)
    appointment = db.get(Appointment, thread.appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Захиалга олдсонгүй")
    _ensure_paid_chat(db, appointment)
    return chat_service.add_message(db, thread, current_user.id, payload.body)


@router.get("/agora/config")
def get_agora_config(_: CurrentUser) -> dict[str, str | None]:
    return {
        "provider": settings.chat_provider,
        "app_id": settings.agora_app_id,
        "project_id": settings.agora_project_id,
        "project_name": settings.agora_project_name,
        "region": settings.agora_region,
        "enabled_features": settings.agora_enabled_features,
        "rtm_enabled": str(settings.agora_feature_rtm).lower(),
    }
