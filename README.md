# e-Lawyer

React Native marketplace for paid legal consultations. The app has two roles in one binary:

- `CLIENT`: browse legal categories, filter lawyers, book and pay, view appointments, leave gated reviews.
- `LAWYER`: create a profile, manage price/categories/availability, see paid client bookings and contact details, manage schedule and reviews.

The backend is FastAPI + PostgreSQL. Payments are pluggable through provider adapters (`mock`, `stripe`, `qpay`) so local development works immediately and production gateways can be added without rewriting the booking flow.

## Folder Structure

```text
.
├── App.tsx
├── app.json
├── src/
│   ├── api/                 # API client and React Query hooks
│   ├── components/          # Reusable mobile UI primitives
│   ├── i18n/                # Locale helpers
│   ├── navigation/          # Role-aware React Navigation
│   ├── screens/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── client/
│   │   └── lawyer/
│   ├── state/               # Zustand auth store
│   ├── theme/               # Design tokens from UI/lexicon_authority
│   └── types/
├── backend/
│   ├── alembic/             # Database migrations
│   └── app/
│       ├── api/routes/      # FastAPI endpoints
│       ├── core/            # Settings and security
│       ├── db/              # SQLAlchemy models/session
│       ├── scripts/         # Seed scripts
│       ├── seeds/           # Category seed data
│       └── services/        # OTP, payments, notifications
├── docker-compose.yml
└── UI/                      # Original HTML/screenshot design references
```

## Backend Setup

For the one-command local stack, use:

```bash
npm run dev:all
```

That command starts PostgreSQL with Docker Compose, creates `backend/.env` if missing, prepares the backend virtualenv, runs migrations, seeds categories, starts FastAPI, and starts Expo.

To launch a platform immediately:

```bash
npm run dev:ios
npm run dev:android
npm run dev:web
```

If a previous run is still occupying ports:

```bash
npm run dev:stop
```

If your default shell uses Node 24, the script will try to run Expo through a compatible Node 20 binary (`node20`, Homebrew `node@20`, or `npx node@20`) while leaving your global Node untouched.

You can override ports:

```bash
API_PORT=8000 EXPO_PORT=8081 npm run dev:all
```

If Docker Desktop is slow to start:

```bash
DOCKER_WAIT_SECONDS=180 npm run dev:all
```

Manual setup:

```bash
cd backend
cp .env.example .env
cd ..
docker compose up -d postgres
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
alembic upgrade head
python -m app.scripts.seed_categories
uvicorn app.main:app --reload
```

API docs run at `http://localhost:8000/docs`.

## Mobile Setup

```bash
cp .env.example .env
npm install
npm run ios
```

For Android emulator, set `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api`. For a physical device, use your machine's LAN IP.

## Core API Endpoints

- `POST /api/auth/register` creates a `CLIENT` or `LAWYER`, hashes password, returns JWT and a dev OTP.
- `POST /api/auth/login` returns JWT.
- `POST /api/auth/otp/request` and `/api/auth/otp/verify` manage phone OTP verification.
- `GET /api/categories` returns seeded legal categories with English and Mongolian labels.
- `GET /api/lawyers` supports category, search, rating, price, and sort filters.
- `PUT /api/lawyers/me/profile` lets lawyers manage bio, categories, availability, credentials, and price.
- `POST /api/payments/checkout` creates a pending appointment/payment hold.
- `POST /api/payments/{id}/confirm` verifies payment, confirms appointment, and notifies the lawyer.
- `GET /api/appointments` returns role-filtered appointments. Lawyers receive paid client contact snapshots.
- `PATCH /api/appointments/{id}` lets lawyers/admins complete or cancel appointments.
- `POST /api/reviews` allows one review only for the paying client on a paid completed appointment.
- `GET /api/admin/reviews` and `PATCH /api/reviews/{id}/moderation` support basic review moderation.

## Seeded Legal Categories

The seed script creates:

1. Civil Law
2. Criminal Defense
3. Administrative Law
4. Business / Corporate Law
5. Family Law
6. Labor Law

Each stores `name` and `description` as JSON i18n maps (`en`, `mn`).

## Key Decisions

- FastAPI + PostgreSQL fits your Python preference and keeps authorization/payment rules server-side.
- JWT is used for API auth; passwords are stored with bcrypt via Passlib.
- OTP is modeled in SQL with hashed codes. The development response includes `dev_otp_code`; production should wire the same service to an SMS provider.
- Appointments are only confirmed after `PaymentStatus.SUCCEEDED`.
- Reviews are gated by server checks: same client, paid payment, completed appointment, one review per appointment.
- Lawyer contact details are not exposed in public profiles. Lawyers see the paying client's phone/email only through their appointment contact snapshot.
- Push notification delivery is isolated in `NotificationService`; plug Expo Push or FCM there.

## Payment Providers

Set `PAYMENT_PROVIDER=mock`, `stripe`, or `qpay`.

- `mock`: local dev, confirms immediately when `mock_success=true`.
- `stripe`: adapter stub expects `STRIPE_SECRET_KEY`; add PaymentIntent create/retrieve calls.
- `qpay`: adapter stub expects `QPAY_USERNAME` and `QPAY_PASSWORD`; add invoice create/status calls.

## Production Notes

- Replace `JWT_SECRET` and `OTP_PEPPER` with long random values.
- Add real SMS, push notification, object storage, and gateway credentials.
- Run Alembic migrations in deployment.
- Add audit logging around payment webhooks, appointment status changes, and admin review moderation.
- Add CI steps: backend lint/test, mobile typecheck, and API contract tests.
