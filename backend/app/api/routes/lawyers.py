from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select
from sqlalchemy.orm import joinedload

from app.api.deps import CurrentUser, DbSession, require_role
from app.db.models import LawyerProfile, User, UserRole
from app.schemas import LawyerOut, LawyerProfileInput

router = APIRouter(prefix="/lawyers", tags=["lawyers"])


def _to_lawyer_out(profile: LawyerProfile, expose_contact: bool = False) -> LawyerOut:
    return LawyerOut(
        user_id=profile.user_id,
        username=profile.user.username,
        email=profile.user.email if expose_contact else None,
        phone_number=profile.user.phone_number if expose_contact else None,
        photo_url=profile.photo_url,
        bio=profile.bio,
        categories=profile.categories,
        price_per_consultation=profile.price_per_consultation,
        currency=profile.currency,
        credentials=profile.credentials,
        auto_response_message=profile.auto_response_message if expose_contact else None,
        avg_rating=profile.avg_rating,
        review_count=profile.review_count,
        availability=profile.availability,
    )


@router.get("", response_model=list[LawyerOut])
def list_lawyers(
    db: DbSession,
    category_id: str | None = None,
    search: str | None = None,
    min_rating: float | None = Query(default=None, ge=0, le=5),
    max_price: int | None = Query(default=None, ge=1),
    sort: str = "rating",
) -> list[LawyerOut]:
    stmt = select(LawyerProfile).options(joinedload(LawyerProfile.user))
    filters = []
    if category_id:
        filters.append(LawyerProfile.categories.any(category_id))
    if min_rating is not None:
        filters.append(LawyerProfile.avg_rating >= min_rating)
    if max_price is not None:
        filters.append(LawyerProfile.price_per_consultation <= max_price)
    if search:
        like = f"%{search.lower()}%"
        filters.append(
            (LawyerProfile.bio.ilike(like))
            | (LawyerProfile.credentials.ilike(like))
            | (User.username.ilike(like))
        )
        stmt = stmt.join(User)
    if filters:
        stmt = stmt.where(and_(*filters))
    if sort == "price":
        stmt = stmt.order_by(LawyerProfile.price_per_consultation.asc())
    elif sort == "reviews":
        stmt = stmt.order_by(LawyerProfile.review_count.desc())
    else:
        stmt = stmt.order_by(LawyerProfile.avg_rating.desc())
    profiles = db.scalars(stmt).all()
    return [_to_lawyer_out(profile) for profile in profiles]


@router.put("/me/profile", response_model=LawyerOut)
def upsert_my_lawyer_profile(
    payload: LawyerProfileInput,
    db: DbSession,
    current_user: User = Depends(require_role(UserRole.LAWYER)),
) -> LawyerOut:
    profile = db.get(LawyerProfile, current_user.id)
    if not profile:
        profile = LawyerProfile(user_id=current_user.id)
        db.add(profile)
    profile.photo_url = payload.photo_url
    profile.bio = payload.bio
    profile.categories = payload.categories
    profile.price_per_consultation = payload.price_per_consultation
    profile.currency = payload.currency
    profile.credentials = payload.credentials
    profile.auto_response_message = payload.auto_response_message.strip() if payload.auto_response_message else None
    profile.availability = payload.availability
    db.commit()
    db.refresh(profile)
    profile.user = current_user
    return _to_lawyer_out(profile, expose_contact=True)


@router.get("/me/profile", response_model=LawyerOut)
def get_my_lawyer_profile(
    db: DbSession,
    current_user: User = Depends(require_role(UserRole.LAWYER)),
) -> LawyerOut:
    profile = db.scalar(
        select(LawyerProfile)
        .where(LawyerProfile.user_id == current_user.id)
        .options(joinedload(LawyerProfile.user))
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Хуульчийн профайл хараахан үүсээгүй байна")
    return _to_lawyer_out(profile, expose_contact=True)


@router.get("/{lawyer_id}", response_model=LawyerOut)
def get_lawyer(lawyer_id: str, db: DbSession) -> LawyerOut:
    profile = db.scalar(
        select(LawyerProfile)
        .where(LawyerProfile.user_id == lawyer_id)
        .options(joinedload(LawyerProfile.user))
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Хуульч олдсонгүй")
    return _to_lawyer_out(profile)
