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

    # Convertimos el modelo SQLAlchemy en un dict serializable
    data = profile.__dict__.copy()
    data.pop("_sa_instance_state", None)

    # Si user_id es UUID, lo devolvemos como string
    if isinstance(data.get("user_id"), UUID):
        data["user_id"] = str(data["user_id"])

    return data
