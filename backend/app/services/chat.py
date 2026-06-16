from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Appointment, ChatMessage, ChatThread, LawyerProfile


def _contact_line(profile: LawyerProfile) -> str:
    user = profile.user
    parts = []
    if user.phone_number:
        parts.append(f"утас: {user.phone_number}")
    if user.email:
        parts.append(f"имэйл: {user.email}")
    return " | ".join(parts)


class ChatService:
    def ensure_thread_for_paid_appointment(self, db: Session, appointment: Appointment) -> ChatThread:
        thread = db.scalar(select(ChatThread).where(ChatThread.appointment_id == appointment.id))
        if thread:
            return thread

        thread = ChatThread(
            appointment_id=appointment.id,
            client_id=appointment.client_id,
            lawyer_id=appointment.lawyer_id,
            agora_channel_id=f"appointment_{appointment.id}",
            last_message_at=datetime.now(timezone.utc),
        )
        db.add(thread)
        db.flush()

        profile = db.get(LawyerProfile, appointment.lawyer_id)
        if profile and profile.auto_response_message:
            body = profile.auto_response_message.strip()
            contact = _contact_line(profile)
            if contact:
                body = f"{body}\n\nХолбоо барих: {contact}"
            db.add(
                ChatMessage(
                    thread_id=thread.id,
                    sender_id=appointment.lawyer_id,
                    body=body,
                    message_type="AUTO_RESPONSE",
                )
            )

        return thread

    def add_message(self, db: Session, thread: ChatThread, sender_id: str, body: str) -> ChatMessage:
        message = ChatMessage(thread_id=thread.id, sender_id=sender_id, body=body.strip(), message_type="TEXT")
        thread.last_message_at = datetime.now(timezone.utc)
        db.add(message)
        db.commit()
        db.refresh(message)
        return message


chat_service = ChatService()
