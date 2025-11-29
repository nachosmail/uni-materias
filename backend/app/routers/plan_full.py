from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import PlanSubject, SubjectPrerequisite, UserSubject

router = APIRouter(tags=["plans_full"])


@router.get("/plan_full")
def get_plan_full(
    plan_id: int = Query(...),
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Devuelve TODA la info del plan para un usuario:
    - Materias del plan
    - Correlatividades (requires / enables)
    - Estado de cada materia para el usuario (approved / in_progress / pending)
    """

    # 1) Todas las materias del plan
    plan_subjects = (
        db.query(PlanSubject)
        .filter(PlanSubject.plan_id == plan_id)
        .all()
    )

    if not plan_subjects:
        return {
            "plan_id": plan_id,
            "user_id": user_id,
            "subjects": []
        }

    subject_ids = [ps.subject_id for ps in plan_subjects]

    # 2) Estados del usuario para ese plan
    user_states = (
        db.query(UserSubject)
        .filter(UserSubject.user_id == user_id)
        .filter(UserSubject.plan_subject_id.in_([ps.id for ps in plan_subjects]))
        .all()
    )
    state_map = {row.plan_subject_id: row.status for row in user_states}

    # 3) Correlatividades (UN solo query)
    prereq_rows = (
        db.query(SubjectPrerequisite)
        .filter(SubjectPrerequisite.subject_id.in_(subject_ids))
        .all()
    )

    # requires: subject_id -> [prereq...]
    requires_map: dict[int, list[dict]] = {}
    # enables: subject_id -> [subjects que habilita...]
    enables_map: dict[int, list[dict]] = {}

    for p in prereq_rows:
        # requires: para cursar p.subject, necesitás p.prereq_subject
        requires_map.setdefault(p.subject_id, []).append({
            "id": p.prereq_subject.id,
            "code": p.prereq_subject.code,
            "name": p.prereq_subject.name
        })

        # enables: la materia prereq_subject habilita a subject
        enables_map.setdefault(p.prereq_subject_id, []).append({
            "id": p.subject.id,
            "code": p.subject.code,
            "name": p.subject.name
        })

    # 4) Construir respuesta final
    subjects_response = []

    for ps in plan_subjects:
        subj = ps.subject
        subjects_response.append({
            "plan_subject_id": ps.id,
            "id": subj.id,
            "code": subj.code,
            "name": subj.name,
            "year_suggested": ps.year_suggested,
            "semester_suggested": ps.semester_suggested,
            "is_elective": ps.is_elective,
            "prerequisites": requires_map.get(subj.id, []),
            "enables": enables_map.get(subj.id, []),
            "status": state_map.get(ps.id, "pending"),
        })

    return {
        "plan_id": plan_id,
        "user_id": user_id,
        "subjects": subjects_response
    }