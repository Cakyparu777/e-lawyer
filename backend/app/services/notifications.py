from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import DeviceToken


class NotificationService:
    def notify_lawyer_booking(self, db: Session, lawyer_id: str, appointment_id: str) -> None:
        tokens = db.scalars(select(DeviceToken).where(DeviceToken.user_id == lawyer_id)).all()
        if not tokens:
            return
        # Production: call FCM or Expo push endpoint here. Keeping this adapter small
        # lets the app switch between native FCM and Expo notifications.
        for token in tokens:
            print(f"notify {token.platform}:{token.token} appointment={appointment_id}")


notification_service = NotificationService()

