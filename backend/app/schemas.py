from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field

from app.db.models import AppointmentStatus, PaymentStatus, UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    id: str
    role: UserRole
    username: str
    email: EmailStr
    phone_number: str
    phone_verified: bool

    model_config = {"from_attributes": True}


class RegisterRequest(BaseModel):
    role: Literal[UserRole.CLIENT, UserRole.LAWYER]
    username: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone_number: str = Field(min_length=7, max_length=32)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OtpRequest(BaseModel):
    purpose: str = "PHONE_VERIFY"


class OtpVerifyRequest(BaseModel):
    code: str = Field(min_length=4, max_length=8)
    purpose: str = "PHONE_VERIFY"


class AuthResponse(BaseModel):
    user: UserPublic
    token: TokenResponse
    dev_otp_code: str | None = None


class LocalizedText(BaseModel):
    en: str
    mn: str


class CategoryOut(BaseModel):
    id: str
    name: dict[str, str]
    description: dict[str, str]
    icon: str
    is_active: bool

    model_config = {"from_attributes": True}


class CategoryUpsert(BaseModel):
    id: str
    name: LocalizedText
    description: LocalizedText
    icon: str = "scale"
    is_active: bool = True


class LawyerProfileInput(BaseModel):
    photo_url: str | None = None
    bio: str = Field(min_length=20)
    categories: list[str] = Field(min_length=1)
    price_per_consultation: int = Field(gt=0)
    currency: str = "MNT"
    credentials: str = Field(min_length=5)
    availability: dict[str, Any] = Field(default_factory=dict)


class LawyerOut(BaseModel):
    user_id: str
    username: str
    email: EmailStr | None = None
    phone_number: str | None = None
    photo_url: str | None
    bio: str
    categories: list[str]
    price_per_consultation: int
    currency: str
    credentials: str
    avg_rating: float
    review_count: int
    availability: dict[str, Any]


class CheckoutRequest(BaseModel):
    lawyer_id: str
    category_id: str
    date_time: datetime
    provider: str = "mock"


class CheckoutResponse(BaseModel):
    appointment_id: str
    payment_id: str
    amount: int
    currency: str
    provider: str
    status: PaymentStatus
    checkout_payload: dict[str, Any]


class PaymentConfirmRequest(BaseModel):
    provider_ref: str | None = None
    mock_success: bool = True


class AppointmentOut(BaseModel):
    id: str
    client_id: str
    lawyer_id: str
    category_id: str
    date_time: datetime
    status: AppointmentStatus
    payment_id: str | None
    client_contact_snapshot: dict[str, str] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AppointmentUpdate(BaseModel):
    status: AppointmentStatus


class PaymentOut(BaseModel):
    id: str
    appointment_id: str | None
    amount: int
    currency: str
    provider: str
    provider_ref: str | None
    status: PaymentStatus

    model_config = {"from_attributes": True}


class ReviewCreate(BaseModel):
    appointment_id: str
    rating: int = Field(ge=1, le=5)
    text: str = Field(min_length=3, max_length=2000)


class ReviewOut(BaseModel):
    id: str
    appointment_id: str
    client_id: str
    lawyer_id: str
    rating: int
    text: str
    is_hidden: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DeviceTokenIn(BaseModel):
    token: str
    platform: Literal["ios", "android", "web"]

