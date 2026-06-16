"""add appointment chat

Revision ID: 0002_chat
Revises: 0001_initial
Create Date: 2026-06-16 00:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_chat"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("lawyer_profiles", sa.Column("auto_response_message", sa.Text(), nullable=True))

    op.create_table(
        "chat_threads",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("appointment_id", sa.String(), nullable=False),
        sa.Column("client_id", sa.String(), nullable=False),
        sa.Column("lawyer_id", sa.String(), nullable=False),
        sa.Column("agora_channel_id", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("last_message_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["appointment_id"], ["appointments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["client_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"]),
        sa.UniqueConstraint("appointment_id"),
    )
    op.create_index("ix_chat_threads_appointment_id", "chat_threads", ["appointment_id"])
    op.create_index("ix_chat_threads_client_id", "chat_threads", ["client_id"])
    op.create_index("ix_chat_threads_lawyer_id", "chat_threads", ["lawyer_id"])

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("thread_id", sa.String(), nullable=False),
        sa.Column("sender_id", sa.String(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("message_type", sa.String(length=32), nullable=False),
        sa.Column("provider_message_id", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["thread_id"], ["chat_threads.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"]),
    )
    op.create_index("ix_chat_messages_thread_id", "chat_messages", ["thread_id"])
    op.create_index("ix_chat_messages_sender_id", "chat_messages", ["sender_id"])
    op.create_index("ix_chat_messages_thread_created", "chat_messages", ["thread_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_chat_messages_thread_created", table_name="chat_messages")
    op.drop_index("ix_chat_messages_sender_id", table_name="chat_messages")
    op.drop_index("ix_chat_messages_thread_id", table_name="chat_messages")
    op.drop_table("chat_messages")
    op.drop_index("ix_chat_threads_lawyer_id", table_name="chat_threads")
    op.drop_index("ix_chat_threads_client_id", table_name="chat_threads")
    op.drop_index("ix_chat_threads_appointment_id", table_name="chat_threads")
    op.drop_table("chat_threads")
    op.drop_column("lawyer_profiles", "auto_response_message")
