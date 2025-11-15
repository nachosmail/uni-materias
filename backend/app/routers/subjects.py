# backend/app/routers/subjects.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import PlanSubject, Subject, SubjectPrerequisite

router = APIRouter(tags=["subjects"])


@router.get("/plan_subjects")
def get_plan_subjects(
    plan_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Devuelve las materias de un plan, con info básica.
    """
    rows = (
        db.query(PlanSubject, Subject)
        .join(Subject, PlanSubject.subject_id == Subject.id)
        .filter(PlanSubject.plan_id == plan_id)
        .all()
    )

    # Armamos lista de materias
    subjects_list = []
    subject_ids = [ps.subject_id for ps, _ in rows]

    # Obtenemos correlativas para todas esas materias
    prereqs = (
        db.query(SubjectPrerequisite)
        .filter(SubjectPrerequisite.subject_id.in_(subject_ids))
        .all()
    )

    # Mapeo subject_id -> lista de prereq_subject_id
    prereq_map: dict[int, list[int]] = {}
    for p in prereqs:
        prereq_map.setdefault(p.subject_id, []).append(p.prereq_subject_id)

    # Pretraer info de materias correlativas
    if prereq_map:
        all_prereq_ids = {pid for lst in prereq_map.values() for pid in lst}
        prereq_subjects = (
            db.query(Subject)
            .filter(Subject.id.in_(all_prereq_ids))
            .all()
        )
        prereq_subject_map = {s.id: s for s in prereq_subjects}
    else:
        prereq_subject_map = {}

    for ps, s in rows:
        prereq_list = []
        for pid in prereq_map.get(ps.subject_id, []):
            subj = prereq_subject_map.get(pid)
            if subj:
                prereq_list.append(
                    {
                        "id": subj.id,
                        "code": subj.code,
                        "name": subj.name,
                    }
                )

        subjects_list.append(
            {
                "id": s.id,
                "code": s.code,
                "name": s.name,
                "year_suggested": ps.year_suggested,
                "semester_suggested": ps.semester_suggested,
                "is_elective": ps.is_elective,
                "prerequisites": prereq_list,
            }
        )

    return subjects_list


@router.get("/subject_correlatives")
def get_subject_correlatives(
    subject_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Devuelve las correlativas necesarias y las materias que habilita.
    """
    # Necesarias
    prereqs = (
        db.query(SubjectPrerequisite, Subject)
        .join(Subject, SubjectPrerequisite.prereq_subject_id == Subject.id)
        .filter(SubjectPrerequisite.subject_id == subject_id)
        .all()
    )

    requires = [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
        }
        for _, s in prereqs
    ]

    # Materias que habilita (invertimos la relación)
    enables_rows = (
        db.query(SubjectPrerequisite, Subject)
        .join(Subject, SubjectPrerequisite.subject_id == Subject.id)
        .filter(SubjectPrerequisite.prereq_subject_id == subject_id)
        .all()
    )

    enables = [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
        }
        for _, s in enables_rows
    ]

    return {
        "subject_id": subject_id,
        "requires": requires,
        "enables": enables,
    }
