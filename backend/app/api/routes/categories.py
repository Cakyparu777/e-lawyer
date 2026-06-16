from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from app.api.deps import DbSession, require_role
from app.db.models import Category, User, UserRole
from app.schemas import CategoryOut, CategoryUpsert

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: DbSession, include_inactive: bool = False) -> list[Category]:
    stmt = select(Category).order_by(Category.id)
    if not include_inactive:
        stmt = stmt.where(Category.is_active.is_(True))
    return list(db.scalars(stmt).all())


@router.put("/{category_id}", response_model=CategoryOut)
def upsert_category(
    category_id: str,
    payload: CategoryUpsert,
    db: DbSession,
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> Category:
    if category_id != payload.id:
        raise HTTPException(status_code=400, detail="Чиглэлийн ID таарахгүй байна")
    category = db.get(Category, category_id)
    if not category:
        category = Category(id=payload.id)
        db.add(category)
    category.name = payload.name.model_dump()
    category.description = payload.description.model_dump()
    category.icon = payload.icon
    category.is_active = payload.is_active
    db.commit()
    db.refresh(category)
    return category
