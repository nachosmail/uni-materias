from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import Base, engine
from app.routers import careers, plans, subjects, user_subjects, user_profiles, plan_full
import os

app = FastAPI()

# ========= CORS =========
origins = [
    os.getenv("ALLOWED_ORIGINS", "http://localhost:4200")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "https://uni-materias.vercel.app",
        ],
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
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "API OK"}
