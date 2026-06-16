from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import require_role
from app.db.models import User, UserRole
from app.services.storage import storage_service

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/lawyer-photo")
def upload_lawyer_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.LAWYER)),
) -> dict[str, str]:
    try:
        url = storage_service.save_lawyer_photo(current_user.id, file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"photo_url": url}

