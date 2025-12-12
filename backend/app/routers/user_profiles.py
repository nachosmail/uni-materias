from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db import get_db
from app import models  # Career, Plan, UserProfile

router = APIRouter(
    prefix="/user_profile",
    tags=["user_profile"],
)


# ========= GET: traer perfil con nombre de carrera y plan =========
@router.get("")
def get_user_profile(user_id: UUID, db: Session = Depends(get_db)):
    """
    Devuelve el perfil del usuario con NOMBRE de carrera y NOMBRE del plan.
    """

    row = (
        db.query(
            models.UserProfile,
            models.Career.name.label("career_name"),
            models.Plan.name.label("plan_name"),
        )
        .join(models.Career, models.Career.id == models.UserProfile.career_id)
        .join(models.Plan, models.Plan.id == models.UserProfile.plan_id)
        .filter(models.UserProfile.user_id == str(user_id))
        .first()
    )

    if not row:
        raise HTTPException(404, "User profile not found")

    profile, career_name, plan_name = row

    return {
        "user_id": str(profile.user_id),
        "career_id": profile.career_id,
        "plan_id": profile.plan_id,
        "career_name": career_name,
        "plan_name": plan_name,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }


# ========= POST: crear / actualizar perfil =========

class UserProfileIn(BaseModel):
    user_id: UUID
    career_id: int
    plan_id: int


@router.post("")
def upsert_user_profile(payload: UserProfileIn, db: Session = Depends(get_db)):
    """
    Crea o actualiza el perfil del usuario (career_id + plan_id).
    """

    # buscar si ya existe perfil
    profile = (
        db.query(models.UserProfile)
        .filter(models.UserProfile.user_id == str(payload.user_id))
        .first()
    )

    now = datetime.utcnow()

    if profile:
        # actualizar
        profile.career_id = payload.career_id
        profile.plan_id = payload.plan_id
        profile.updated_at = now
    else:
        # crear nuevo
        profile = models.UserProfile(
            user_id=str(payload.user_id),
            career_id=payload.career_id,
            plan_id=payload.plan_id,
            created_at=now,
            updated_at=now,
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)

    return {
        "user_id": str(profile.user_id),
        "career_id": profile.career_id,
        "plan_id": profile.plan_id,
    }
