# backend/app/routers/user_profiles.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db import get_db
from app.models import UserProfile, Plan, UserSubject

router = APIRouter(tags=["user_profiles"])


class UserProfilePayload(BaseModel):
    user_id: str
    career_id: int
    plan_id: int


@router.get("/user_profile")
def get_user_profile(
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Devuelve el perfil de usuario + nombres de carrera y plan
    en un solo GET.
    """
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .first()
    )

    if not profile:
        return None

    return {
        "user_id": profile.user_id,
        "career_id": profile.career_id,
        "plan_id": profile.plan_id,
        "career_name": profile.career.name if profile.career else None,
        "plan_name": (
            f"{profile.plan.code} - {profile.plan.name}"
            if profile.plan
            else None
        ),
    }


@router.post("/user_profile")
def upsert_user_profile(
    payload: UserProfilePayload,
    db: Session = Depends(get_db)
):
    """
    Guarda o actualiza el perfil del usuario.

    ✔ Valida que el plan pertenezca a la carrera seleccionada.
    ✔ Si el usuario cambia de plan, se borran sus estados de materias
      (user_subjects) para evitar basura del plan anterior.
    """

    # Validar plan
    plan = db.query(Plan).filter(Plan.id == payload.plan_id).first()
    if not plan:
        raise HTTPException(status_code=400, detail="Plan no encontrado")

    if plan.career_id != payload.career_id:
        raise HTTPException(
            status_code=400,
            detail="El plan no pertenece a la carrera seleccionada",
        )

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == payload.user_id)
        .first()
    )

    # Si existe y cambia de plan → limpiar estados de materias
    if profile and profile.plan_id != payload.plan_id:
        (
            db.query(UserSubject)
            .filter(UserSubject.user_id == payload.user_id)
            .delete(synchronize_session=False)
        )

    if profile:
        profile.career_id = payload.career_id
        profile.plan_id = payload.plan_id
    else:
        profile = UserProfile(
            user_id=payload.user_id,
            career_id=payload.career_id,
            plan_id=payload.plan_id,
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)

    return {
        "user_id": profile.user_id,
        "career_id": profile.career_id,
        "plan_id": profile.plan_id,
        "career_name": profile.career.name if profile.career else None,
        "plan_name": (
            f"{profile.plan.code} - {profile.plan.name}"
            if profile.plan
            else None
        ),
    }
