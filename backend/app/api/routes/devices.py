from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.db.models import DeviceToken
from app.schemas import DeviceTokenIn

router = APIRouter(prefix="/devices", tags=["devices"])


@router.post("/push-token")
def save_push_token(payload: DeviceTokenIn, current_user: CurrentUser, db: DbSession) -> dict[str, bool]:
    token = db.scalar(select(DeviceToken).where(DeviceToken.token == payload.token))
    if not token:
        token = DeviceToken(user_id=current_user.id, token=payload.token, platform=payload.platform)
        db.add(token)
    else:
        token.user_id = current_user.id
        token.platform = payload.platform
    db.commit()
    return {"saved": True}

