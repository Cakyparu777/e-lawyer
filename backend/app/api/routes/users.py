from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession

router = APIRouter(prefix="/users", tags=["users"])


@router.delete("/me")
def delete_account(current_user: CurrentUser, db: DbSession) -> dict[str, bool]:
    current_user.is_active = False
    db.commit()
    return {"deleted": True}

