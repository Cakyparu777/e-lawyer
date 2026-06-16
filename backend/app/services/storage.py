import shutil
from pathlib import Path

from fastapi import UploadFile

UPLOAD_ROOT = Path("storage/uploads")


class StorageService:
    def save_lawyer_photo(self, user_id: str, file: UploadFile) -> str:
        suffix = Path(file.filename or "photo.jpg").suffix.lower() or ".jpg"
        if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
            raise ValueError("Дэмжигдээгүй зургийн төрөл байна")
        UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
        destination = UPLOAD_ROOT / f"lawyer-{user_id}{suffix}"
        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return f"/uploads/{destination.name}"


storage_service = StorageService()
