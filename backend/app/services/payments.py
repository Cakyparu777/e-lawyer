from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

from app.core.config import settings


@dataclass(frozen=True)
class PaymentIntent:
    provider_ref: str
    checkout_payload: dict[str, Any]


class PaymentProvider(ABC):
    name: str

    @abstractmethod
    def create_intent(self, amount: int, currency: str, metadata: dict[str, Any]) -> PaymentIntent:
        raise NotImplementedError

    @abstractmethod
    def verify_payment(self, provider_ref: str | None, payload: dict[str, Any]) -> bool:
        raise NotImplementedError


class MockPaymentProvider(PaymentProvider):
    name = "mock"

    def create_intent(self, amount: int, currency: str, metadata: dict[str, Any]) -> PaymentIntent:
        ref = f"mock_{metadata['appointment_id']}"
        return PaymentIntent(
            provider_ref=ref,
            checkout_payload={
                "mode": "mock",
                "providerRef": ref,
                "amount": amount,
                "currency": currency,
            },
        )

    def verify_payment(self, provider_ref: str | None, payload: dict[str, Any]) -> bool:
        return bool(payload.get("mock_success", True)) and bool(provider_ref)


class StripePaymentProvider(PaymentProvider):
    name = "stripe"

    def create_intent(self, amount: int, currency: str, metadata: dict[str, Any]) -> PaymentIntent:
        if not settings.stripe_secret_key:
            raise RuntimeError("STRIPE_SECRET_KEY is not configured")
        # Hook point: call Stripe PaymentIntent API with idempotency key.
        ref = f"stripe_pending_{metadata['appointment_id']}"
        return PaymentIntent(provider_ref=ref, checkout_payload={"clientSecret": ref, "provider": "stripe"})

    def verify_payment(self, provider_ref: str | None, payload: dict[str, Any]) -> bool:
        # Hook point: retrieve PaymentIntent from Stripe and require status=succeeded.
        return bool(provider_ref and payload.get("provider_status", "succeeded") == "succeeded")


class QPayPaymentProvider(PaymentProvider):
    name = "qpay"

    def create_intent(self, amount: int, currency: str, metadata: dict[str, Any]) -> PaymentIntent:
        if not settings.qpay_username or not settings.qpay_password:
            raise RuntimeError("QPay credentials are not configured")
        ref = f"qpay_pending_{metadata['appointment_id']}"
        return PaymentIntent(provider_ref=ref, checkout_payload={"invoiceId": ref, "provider": "qpay"})

    def verify_payment(self, provider_ref: str | None, payload: dict[str, Any]) -> bool:
        # Hook point: check QPay invoice status before confirming appointment.
        return bool(provider_ref and payload.get("paid", True))


providers: dict[str, PaymentProvider] = {
    "mock": MockPaymentProvider(),
    "stripe": StripePaymentProvider(),
    "qpay": QPayPaymentProvider(),
}


def get_payment_provider(name: str | None = None) -> PaymentProvider:
    provider_name = (name or settings.payment_provider).lower()
    provider = providers.get(provider_name)
    if not provider:
        raise ValueError(f"Дэмжигдээгүй төлбөрийн суваг байна: {provider_name}")
    return provider
