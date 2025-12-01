from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.db import get_db
from app.models import UserSubject
from uuid import UUID

router = APIRouter(tags=["user_subjects"])


class UserSubjectPayload(BaseModel):
    user_id: UUID
    plan_subject_id: int
    status: str  # debe coincidir con ENUM


VALID_STATUS = {
    "aprobada",
    "pendiente_final",
    "desaprobada",
    "sin_cursar"
}


@router.get("/user_subjects")
def get_user_subjects(user_id: UUID, db: Session = Depends(get_db)):
    rows = db.query(UserSubject).filter(UserSubject.user_id == user_id).all()

    return [
        {
            "id": r.id,
            "plan_subject_id": r.plan_subject_id,
            "status": r.status,
            "grade": r.grade
        }
        for r in rows
    ]


@router.post("/user_subjects")
def upsert_user_subject(payload: UserSubjectPayload, db: Session = Depends(get_db)):

    if payload.status not in VALID_STATUS:
        raise HTTPException(400, f"Estado inválido: {payload.status}")

    row = db.query(UserSubject).filter(
        UserSubject.user_id == payload.user_id,
        UserSubject.plan_subject_id == payload.plan_subject_id,
    ).first()

    if row:
        row.status = payload.status
        row.updated_at = datetime.utcnow()
    else:
        row = UserSubject(
            user_id=payload.user_id,
            plan_subject_id=payload.plan_subject_id,
            status=payload.status,
            updated_at=datetime.utcnow()
        )
        db.add(row)

    db.commit()
    db.refresh(row)

    return {
        "id": row.id,
        "status": row.status,
        "plan_subject_id": row.plan_subject_id
    }
