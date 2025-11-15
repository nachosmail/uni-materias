# backend/app/routers/plans.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Plan

router = APIRouter()

@router.get("/plans")
def get_plans(career_id: int = Query(...), db: Session = Depends(get_db)):
    plans = db.query(Plan).filter(Plan.career_id == career_id).all()
    return [
        {
            "id": p.id,
            "code": p.code,
            "name": p.name,
            "is_active": p.is_active
        }
        for p in plans
    ]
