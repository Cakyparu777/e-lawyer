from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select

from app.api.deps import CurrentUser, DbSession, require_role
from app.db.models import Appointment, AppointmentStatus, Payment, PaymentStatus, User, UserRole
from app.schemas import AppointmentOut, AppointmentUpdate

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _appointment_for_role(appointment: Appointment, user: User) -> AppointmentOut:
    data = AppointmentOut.model_validate(appointment)
    if user.role == UserRole.CLIENT:
        data.client_contact_snapshot = None
    return data


@router.get("", response_model=list[AppointmentOut])
def list_appointments(
    db: DbSession,
    current_user: CurrentUser,
    status: AppointmentStatus | None = None,
) -> list[AppointmentOut]:
    stmt = select(Appointment)
    if current_user.role == UserRole.CLIENT:
        stmt = stmt.where(Appointment.client_id == current_user.id)
    elif current_user.role == UserRole.LAWYER:
        stmt = stmt.where(Appointment.lawyer_id == current_user.id)
    else:
        stmt = stmt.where(or_(Appointment.client_id.is_not(None), Appointment.lawyer_id.is_not(None)))
    if status:
        stmt = stmt.where(Appointment.status == status)
    stmt = stmt.order_by(Appointment.date_time.desc())
    return [_appointment_for_role(item, current_user) for item in db.scalars(stmt).all()]


@router.get("/{appointment_id}", response_model=AppointmentOut)
def get_appointment(appointment_id: str, db: DbSession, current_user: CurrentUser) -> AppointmentOut:
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Захиалга олдсонгүй")
    allowed = current_user.role == UserRole.ADMIN or current_user.id in {
        appointment.client_id,
        appointment.lawyer_id,
    }
    if not allowed:
        raise HTTPException(status_code=403, detail="Энэ захиалгыг харах эрхгүй байна")
    return _appointment_for_role(appointment, current_user)


@router.patch("/{appointment_id}", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: str,
    payload: AppointmentUpdate,
    db: DbSession,
    current_user: User = Depends(require_role(UserRole.LAWYER, UserRole.ADMIN)),
) -> AppointmentOut:
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Захиалга олдсонгүй")
    if current_user.role == UserRole.LAWYER and appointment.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Энэ захиалгыг шинэчлэх эрхгүй байна")
    payment = db.get(Payment, appointment.payment_id) if appointment.payment_id else None
    if payload.status == AppointmentStatus.COMPLETED and (
        not payment or payment.status != PaymentStatus.SUCCEEDED
    ):
        raise HTTPException(status_code=400, detail="Зөвхөн төлбөр нь төлөгдсөн захиалгыг дуусгах боломжтой")
    appointment.status = payload.status
    db.commit()
    db.refresh(appointment)
    return _appointment_for_role(appointment, current_user)
