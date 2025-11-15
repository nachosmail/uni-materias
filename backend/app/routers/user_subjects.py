# backend/app/routers/user_subjects.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db import get_db
from app.models import UserSubject

router = APIRouter(tags=["user_subjects"])


class UserSubjectUpdate(BaseModel):
    user_id: str
    subject_id: int
    status: str  # 'approved', 'in_progress', 'pending'


@router.get("/user_subjects")
def get_user_subjects(
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Devuelve el estado de todas las materias de un usuario:
    [
      { "subject_id": 10, "status": "approved" },
      ...
    ]
    """
    rows = db.query(UserSubject).filter(UserSubject.user_id == user_id).all()
    return [
        {"subject_id": r.subject_id, "status": r.status}
        for r in rows
    ]


@router.post("/user_subjects")
def upsert_user_subject(
    payload: UserSubjectUpdate,
    db: Session = Depends(get_db)
):
    """
    Crea o actualiza el estado de una materia de un usuario.
    """
    row = (
        db.query(UserSubject)
        .filter(
            UserSubject.user_id == payload.user_id,
            UserSubject.subject_id == payload.subject_id,
        )
        .first()
    )

    if row:
        row.status = payload.status
    else:
        row = UserSubject(
            user_id=payload.user_id,
            subject_id=payload.subject_id,
            status=payload.status,
        )
        db.add(row)

    db.commit()
    db.refresh(row)

    return {
        "subject_id": row.subject_id,
        "status": row.status,
    }
