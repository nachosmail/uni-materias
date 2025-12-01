import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routers import (
    careers,
    plans,
    subjects,
    user_subjects,
    user_profiles,
    plan_full,
)

app = FastAPI()

# ========= CORS =========
# ALLOWED_ORIGINS en env: lista separada por comas
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:4200,https://uni-materias.vercel.app"
)
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

print("CORS allowed origins:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========= RUTAS =========
app.include_router(careers.router, prefix="/api")
app.include_router(plans.router, prefix="/api")
app.include_router(subjects.router, prefix="/api")
app.include_router(user_subjects.router, prefix="/api")
app.include_router(user_profiles.router, prefix="/api")
app.include_router(plan_full.router, prefix="/api")

# ========= DB =========
ENV = os.getenv("ENV", "dev")
if ENV == "dev":
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "API OK"}
