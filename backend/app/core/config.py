from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    database_url: str
    jwt_secret: str
    jwt_expires_minutes: int = 60 * 24 * 7
    otp_pepper: str
    otp_ttl_minutes: int = 10
    otp_static_code: str | None = "1234"
    payment_provider: str = "mock"
    stripe_secret_key: str | None = None
    qpay_username: str | None = None
    qpay_password: str | None = None
    fcm_server_key: str | None = None
    chat_provider: str = "local"
    agora_app_id: str | None = None
    agora_project_id: str | None = None
    agora_project_name: str | None = None
    agora_region: str = "global"
    agora_enabled_features: str | None = None
    agora_feature_rtc: bool = False
    agora_feature_rtm: bool = False
    agora_feature_convoai: bool = False
    agora_app_certificate: str | None = None
    agora_rtm_token_expire_seconds: int = 3600
    agora_customer_id: str | None = None
    agora_customer_secret: str | None = None
    cors_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:8081",
        "http://localhost:19006",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
