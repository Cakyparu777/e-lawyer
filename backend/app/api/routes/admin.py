from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.api.deps import DbSession, require_role
from app.db.models import Review, User, UserRole
from app.schemas import ReviewOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/reviews", response_model=list[ReviewOut])
def list_reviews_for_moderation(
    db: DbSession,
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> list[Review]:
    return list(db.scalars(select(Review).order_by(Review.created_at.desc())).all())

