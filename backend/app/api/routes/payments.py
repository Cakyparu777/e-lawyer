from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from app.api.deps import DbSession, require_role
from app.db.models import (
    Appointment,
    AppointmentStatus,
    Category,
    LawyerProfile,
    Payment,
    PaymentStatus,
    User,
    UserRole,
)
from app.schemas import CheckoutRequest, CheckoutResponse, PaymentConfirmRequest, PaymentOut
from app.services.notifications import notification_service
from app.services.payments import get_payment_provider

router = APIRouter(prefix="/payments", tags=["payments"])


def _ensure_slot_available(profile: LawyerProfile, date_time) -> None:
    availability = profile.availability or {}
    weekdays = availability.get("weekdays") or []
    slots = availability.get("slots") or []
    weekday = date_time.strftime("%a").upper()
    slot = date_time.strftime("%H:%M")

    if weekdays and weekday not in weekdays:
        raise HTTPException(status_code=400, detail="Энэ өдөр хуульч боломжгүй байна")
    if slots and slot not in slots:
        raise HTTPException(status_code=400, detail="Энэ цагт хуульч боломжгүй байна")


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(
    payload: CheckoutRequest,
    db: DbSession,
    current_user: User = Depends(require_role(UserRole.CLIENT)),
) -> CheckoutResponse:
    if not current_user.phone_verified:
        raise HTTPException(status_code=403, detail="Захиалга хийхээс өмнө утасны дугаараа баталгаажуулна уу")
    profile = db.get(LawyerProfile, payload.lawyer_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Хуульч олдсонгүй")
    if payload.category_id not in profile.categories:
        raise HTTPException(status_code=400, detail="Энэ хуульч тухайн чиглэлээр үйлчилгээ үзүүлэхгүй")
    if not db.get(Category, payload.category_id):
        raise HTTPException(status_code=404, detail="Чиглэл олдсонгүй")
    _ensure_slot_available(profile, payload.date_time)

    appointment = Appointment(
        client_id=current_user.id,
        lawyer_id=payload.lawyer_id,
        category_id=payload.category_id,
        date_time=payload.date_time,
        status=AppointmentStatus.PENDING,
        client_contact_snapshot={
            "username": current_user.username,
            "email": current_user.email,
            "phoneNumber": current_user.phone_number,
        },
    )
    db.add(appointment)
    db.flush()

    provider = get_payment_provider(payload.provider)
    intent = provider.create_intent(
        amount=profile.price_per_consultation,
        currency=profile.currency,
        metadata={"appointment_id": appointment.id, "client_id": current_user.id},
    )
    payment = Payment(
        appointment_id=appointment.id,
        amount=profile.price_per_consultation,
        currency=profile.currency,
        provider=provider.name,
        provider_ref=intent.provider_ref,
        status=PaymentStatus.PENDING,
        meta={"lawyer_id": payload.lawyer_id},
    )
    db.add(payment)
    db.flush()
    appointment.payment_id = payment.id
    db.commit()
    return CheckoutResponse(
        appointment_id=appointment.id,
        payment_id=payment.id,
        amount=payment.amount,
        currency=payment.currency,
        provider=payment.provider,
        status=payment.status,
        checkout_payload=intent.checkout_payload,
    )


@router.post("/{payment_id}/confirm", response_model=PaymentOut)
def confirm_payment(
    payment_id: str,
    payload: PaymentConfirmRequest,
    db: DbSession,
    current_user: User = Depends(require_role(UserRole.CLIENT)),
) -> Payment:
    payment = db.get(Payment, payment_id)
    if not payment or not payment.appointment_id:
        raise HTTPException(status_code=404, detail="Төлбөр олдсонгүй")
    appointment = db.get(Appointment, payment.appointment_id)
    if not appointment or appointment.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Энэ төлбөрийг баталгаажуулах эрхгүй байна")

    provider = get_payment_provider(payment.provider)
    provider_ref = payload.provider_ref or payment.provider_ref
    if not provider.verify_payment(provider_ref, payload.model_dump()):
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(status_code=402, detail="Төлбөр баталгаажуулахад алдаа гарлаа")

    payment.provider_ref = provider_ref
    payment.status = PaymentStatus.SUCCEEDED
    appointment.status = AppointmentStatus.CONFIRMED
    db.commit()
    notification_service.notify_lawyer_booking(db, appointment.lawyer_id, appointment.id)
    return payment


@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment(payment_id: str, db: DbSession, current_user: User = Depends(require_role(UserRole.CLIENT))):
    payment = db.scalar(select(Payment).where(Payment.id == payment_id))
    if not payment or not payment.appointment_id:
        raise HTTPException(status_code=404, detail="Төлбөр олдсонгүй")
    appointment = db.scalar(select(Appointment).where(Appointment.id == payment.appointment_id))
    if appointment and appointment.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Энэ төлбөрийг харах эрхгүй байна")
    return payment
