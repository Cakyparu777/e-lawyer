import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import OtpCode, User


def _hash_code(user_id: str, code: str, purpose: str) -> str:
    message = f"{user_id}:{purpose}:{code}".encode()
    return hmac.new(settings.otp_pepper.encode(), message, hashlib.sha256).hexdigest()


class OtpService:
    def create_code(self, db: Session, user: User, purpose: str = "PHONE_VERIFY") -> str:
        if settings.app_env != "production" and settings.otp_static_code:
            code = settings.otp_static_code
        else:
            code = f"{secrets.randbelow(1_000_000):06d}"
        otp = OtpCode(
            user_id=user.id,
            purpose=purpose,
            code_hash=_hash_code(user.id, code, purpose),
            expires_at=datetime.now(UTC) + timedelta(minutes=settings.otp_ttl_minutes),
        )
        db.add(otp)
        db.commit()
        # Production: send through SMS provider. Development returns it for local testing.
        return code

    def verify_code(self, db: Session, user: User, code: str, purpose: str = "PHONE_VERIFY") -> bool:
        stmt = (
            select(OtpCode)
            .where(
                OtpCode.user_id == user.id,
                OtpCode.purpose == purpose,
                OtpCode.consumed_at.is_(None),
                OtpCode.expires_at > datetime.now(UTC),
            )
            .order_by(OtpCode.created_at.desc())
        )
        otp = db.scalars(stmt).first()
        if not otp:
            return False
        expected = _hash_code(user.id, code, purpose)
        if not hmac.compare_digest(otp.code_hash, expected):
            return False
        otp.consumed_at = datetime.now(UTC)
        if purpose == "PHONE_VERIFY":
            user.phone_verified = True
        db.commit()
        return True


otp_service = OtpService()
