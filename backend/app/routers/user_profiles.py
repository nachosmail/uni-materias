from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app import models  # ya no usamos schemas acá

router = APIRouter(
    prefix="/user_profile",
    tags=["user_profile"],
)


@router.get("")
def get_user_profile(user_id: UUID, db: Session = Depends(get_db)):
    """
    Devuelve el perfil del usuario con NOMBRE de carrera y NOMBRE del plan.
    """

    row = (
        db.query(
            models.UserProfile,
            models.Career.name.label("career_name"),
            models.Plan.name.label("plan_name")
        )
        .join(models.Career, models.Career.id == models.UserProfile.career_id)
        .join(models.Plan, models.Plan.id == models.UserProfile.plan_id)
        .filter(models.UserProfile.user_id == str(user_id))
        .first()
    )

    if not row:
        return None
        # raise HTTPException(404, "User profile not found")

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