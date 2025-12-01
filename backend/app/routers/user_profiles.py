from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app import models, schemas  # ajustá si tus nombres de módulos son distintos

router = APIRouter(
    prefix="/user_profile",
    tags=["user_profile"],
)


@router.get("", response_model=schemas.UserProfile)
def get_user_profile(user_id: UUID, db: Session = Depends(get_db)):
    """
    Devuelve el perfil de usuario asociado al user_id recibido como query param.

    Ejemplo de URL:
    GET /api/user_profile?user_id=6530e60d-92cc-44f4-a97d-223befd5c312
    """
    profile = (
        db.query(models.UserProfile)
        .filter(models.UserProfile.user_id == user_id)
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="User profile not found",
        )

    return profile
