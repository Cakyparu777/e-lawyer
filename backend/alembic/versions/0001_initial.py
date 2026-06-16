"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-16 00:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    user_role = postgresql.ENUM("CLIENT", "LAWYER", "ADMIN", name="userrole", create_type=False)
    appointment_status = postgresql.ENUM(
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        name="appointmentstatus",
        create_type=False,
    )
    payment_status = postgresql.ENUM(
        "PENDING",
        "SUCCEEDED",
        "FAILED",
        "REFUNDED",
        name="paymentstatus",
        create_type=False,
    )
    user_role.create(op.get_bind(), checkfirst=True)
    appointment_status.create(op.get_bind(), checkfirst=True)
    payment_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("role", user_role, nullable=False),
        sa.Column("username", sa.String(length=80), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone_number", sa.String(length=32), nullable=False),
        sa.Column("phone_verified", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("phone_number"),
    )
    op.create_index("ix_users_role", "users", ["role"])

    op.create_table(
        "categories",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("description", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("icon", sa.String(length=64), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "lawyer_profiles",
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("photo_url", sa.String(length=1000), nullable=True),
        sa.Column("bio", sa.Text(), nullable=False),
        sa.Column("categories", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("price_per_consultation", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=8), nullable=False),
        sa.Column("credentials", sa.Text(), nullable=False),
        sa.Column("avg_rating", sa.Float(), server_default="0", nullable=False),
        sa.Column("review_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("availability", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "payments",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("appointment_id", sa.String(), nullable=True),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=8), nullable=False),
        sa.Column("provider", sa.String(length=32), nullable=False),
        sa.Column("provider_ref", sa.String(length=255), nullable=True),
        sa.Column("status", payment_status, nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "appointments",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("client_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("lawyer_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("category_id", sa.String(), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("date_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", appointment_status, nullable=False),
        sa.Column("payment_id", sa.String(), sa.ForeignKey("payments.id"), nullable=True),
        sa.Column("client_contact_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_appointments_client", "appointments", ["client_id", "date_time"])
    op.create_index("ix_appointments_lawyer", "appointments", ["lawyer_id", "date_time"])
    op.create_index(
        "uq_lawyer_slot_active",
        "appointments",
        ["lawyer_id", "date_time"],
        unique=True,
        postgresql_where=sa.text("status != 'CANCELLED'"),
    )
    op.create_foreign_key(
        "fk_payments_appointment",
        "payments",
        "appointments",
        ["appointment_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_table(
        "reviews",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("appointment_id", sa.String(), sa.ForeignKey("appointments.id"), nullable=False),
        sa.Column("client_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("lawyer_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("is_hidden", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),
        sa.UniqueConstraint("appointment_id", name="uq_reviews_appointment"),
    )
    op.create_index("ix_reviews_lawyer", "reviews", ["lawyer_id", "created_at"])

    op.create_table(
        "otp_codes",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("purpose", sa.String(length=32), nullable=False),
        sa.Column("code_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_otp_user_purpose", "otp_codes", ["user_id", "purpose"])

    op.create_table(
        "device_tokens",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token", sa.String(length=255), nullable=False),
        sa.Column("platform", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("token"),
    )


def downgrade() -> None:
    op.drop_table("device_tokens")
    op.drop_table("otp_codes")
    op.drop_index("ix_reviews_lawyer", table_name="reviews")
    op.drop_table("reviews")
    op.drop_constraint("fk_payments_appointment", "payments", type_="foreignkey")
    op.drop_index("uq_lawyer_slot_active", table_name="appointments")
    op.drop_index("ix_appointments_lawyer", table_name="appointments")
    op.drop_index("ix_appointments_client", table_name="appointments")
    op.drop_table("appointments")
    op.drop_table("payments")
    op.drop_table("lawyer_profiles")
    op.drop_table("categories")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_table("users")
    postgresql.ENUM(name="paymentstatus").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="appointmentstatus").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="userrole").drop(op.get_bind(), checkfirst=True)
