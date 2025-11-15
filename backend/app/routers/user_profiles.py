# backend/app/routers/user_profiles.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db import get_db
from app.models import UserProfile

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
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return None

    return {
        "user_id": profile.user_id,
        "career_id": profile.career_id,
        "plan_id": profile.plan_id,
    }


@router.post("/user_profile")
def upsert_user_profile(
    payload: UserProfilePayload,
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == payload.user_id).first()

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
    }
