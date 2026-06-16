from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select

from app.api.deps import DbSession, require_role
from app.db.models import Appointment, AppointmentStatus, LawyerProfile, Payment, PaymentStatus, Review, User, UserRole
from app.schemas import ReviewCreate, ReviewOut

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/lawyers/{lawyer_id}", response_model=list[ReviewOut])
def list_lawyer_reviews(lawyer_id: str, db: DbSession) -> list[Review]:
    stmt = (
        select(Review)
        .where(Review.lawyer_id == lawyer_id, Review.is_hidden.is_(False))
        .order_by(Review.created_at.desc())
    )
    return list(db.scalars(stmt).all())


@router.post("", response_model=ReviewOut)
def create_review(
    payload: ReviewCreate,
    db: DbSession,
    current_user: User = Depends(require_role(UserRole.CLIENT)),
) -> Review:
    appointment = db.get(Appointment, payload.appointment_id)
    if not appointment or appointment.client_id != current_user.id:
        raise HTTPException(status_code=404, detail="Дууссан, төлбөртэй захиалга олдсонгүй")
    if appointment.status != AppointmentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Зөвхөн дууссан захиалгад үнэлгээ үлдээх боломжтой")
    payment = db.get(Payment, appointment.payment_id) if appointment.payment_id else None
    if not payment or payment.status != PaymentStatus.SUCCEEDED:
        raise HTTPException(status_code=400, detail="Зөвхөн төлбөр нь төлөгдсөн захиалгад үнэлгээ үлдээх боломжтой")
    existing = db.scalar(select(Review).where(Review.appointment_id == appointment.id))
    if existing:
        raise HTTPException(status_code=409, detail="Энэ захиалгад аль хэдийн үнэлгээ үлдээсэн байна")

    review = Review(
        appointment_id=appointment.id,
        client_id=current_user.id,
        lawyer_id=appointment.lawyer_id,
        rating=payload.rating,
        text=payload.text.strip(),
    )
    db.add(review)
    db.flush()

    profile = db.get(LawyerProfile, appointment.lawyer_id)
    if profile:
        stats = db.execute(
            select(func.avg(Review.rating), func.count(Review.id)).where(
                Review.lawyer_id == appointment.lawyer_id,
                Review.is_hidden.is_(False),
            )
        ).one()
        profile.avg_rating = round(float(stats[0] or 0), 2)
        profile.review_count = int(stats[1] or 0)
    db.commit()
    db.refresh(review)
    return review


@router.patch("/{review_id}/moderation", response_model=ReviewOut)
def moderate_review(
    review_id: str,
    is_hidden: bool,
    db: DbSession,
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> Review:
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Үнэлгээ олдсонгүй")
    review.is_hidden = is_hidden
    db.commit()
    db.refresh(review)
    return review
