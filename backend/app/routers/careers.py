# backend/app/routers/careers.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Career

router = APIRouter()

@router.get("/careers")
def get_careers(db: Session = Depends(get_db)):
    careers = db.query(Career).all()
    return [{"id": c.id, "name": c.name} for c in careers]
