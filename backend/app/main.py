from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import admin, appointments, auth, categories, devices, lawyers, payments, reviews, uploads, users
from app.core.config import settings

app = FastAPI(title="e-Lawyer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}


app.include_router(auth.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(lawyers.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(devices.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.mount("/uploads", StaticFiles(directory="storage/uploads", check_dir=False), name="uploads")
