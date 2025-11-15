from pydantic import BaseModel
from typing import Optional
from enum import Enum


class SubjectStatus(str, Enum):
    aprobada = "aprobada"
    pendiente_final = "pendiente_final"
    desaprobada = "desaprobada"
    sin_cursar = "sin_cursar"


# ----------------------------
# SUBJECTS
# ----------------------------
class SubjectOut(BaseModel):
    id: int
    code: str
    name: str
    credits: int

    class Config:
        from_attributes = True


# ----------------------------
# PLAN SUBJECTS
# ----------------------------
class PlanSubjectOut(BaseModel):
    id: int
    plan_id: int
    subject: SubjectOut
    year_suggested: Optional[int]
    semester_suggested: Optional[int]
    is_elective: bool

    class Config:
        from_attributes = True


# ----------------------------
# USER SUBJECTS
# ----------------------------
class UserSubjectIn(BaseModel):
    plan_subject_id: int
    status: SubjectStatus
    grade: Optional[int] = None


class UserSubjectOut(BaseModel):
    plan_subject_id: int
    status: SubjectStatus
    grade: Optional[int]

    class Config:
        from_attributes = True


# ----------------------------
# AVAILABLE
# ----------------------------
class AvailableSubjectOut(BaseModel):
    plan_subject_id: int
    subject: SubjectOut

    class Config:
        from_attributes = True
