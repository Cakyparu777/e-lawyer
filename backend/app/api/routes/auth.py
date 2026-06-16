from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models import User
from app.schemas import (
    AuthResponse,
    LoginRequest,
    OtpRequest,
    OtpVerifyRequest,
    RegisterRequest,
    TokenResponse,
    UserPublic,
)
from app.services.otp import otp_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: DbSession) -> AuthResponse:
    existing = db.scalar(
        select(User).where((User.email == payload.email) | (User.phone_number == payload.phone_number))
    )
    if existing:
        raise HTTPException(status_code=409, detail="Имэйл эсвэл утасны дугаар аль хэдийн бүртгэлтэй байна")

    user = User(
        role=payload.role,
        username=payload.username.strip(),
        email=str(payload.email).lower(),
        phone_number=payload.phone_number.strip(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    dev_code = otp_service.create_code(db, user)
    token = TokenResponse(access_token=create_access_token(user.id))
    return AuthResponse(user=UserPublic.model_validate(user), token=token, dev_otp_code=dev_code)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: DbSession) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Имэйл эсвэл нууц үг буруу байна")
    token = TokenResponse(access_token=create_access_token(user.id))
    return AuthResponse(user=UserPublic.model_validate(user), token=token)


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUser) -> User:
    return current_user


@router.post("/otp/request")
def request_otp(payload: OtpRequest, current_user: CurrentUser, db: DbSession) -> dict[str, str]:
    code = otp_service.create_code(db, current_user, payload.purpose)
    return {"status": "sent", "dev_otp_code": code}


@router.post("/otp/verify")
def verify_otp(payload: OtpVerifyRequest, current_user: CurrentUser, db: DbSession) -> dict[str, bool]:
    verified = otp_service.verify_code(db, current_user, payload.code, payload.purpose)
    if not verified:
        raise HTTPException(status_code=400, detail="OTP код буруу эсвэл хугацаа нь дууссан байна")
    return {"verified": True}
