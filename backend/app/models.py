from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey, Enum as PgEnum
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import ENUM
from datetime import datetime
from .db import Base


# --------------------------------------
# CAREERS
# --------------------------------------
class Career(Base):
    __tablename__ = "careers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)


# --------------------------------------
# PLANS
# --------------------------------------
class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    career_id: Mapped[int] = mapped_column(ForeignKey("careers.id"))
    code: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    career = relationship("Career", backref="plans")


# --------------------------------------
# SUBJECT
# --------------------------------------
class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    credits: Mapped[int] = mapped_column(Integer, default=0)


# --------------------------------------
# PLAN SUBJECT
# --------------------------------------
class PlanSubject(Base):
    __tablename__ = "plan_subjects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))

    year_suggested: Mapped[int | None]
    semester_suggested: Mapped[int | None]
    is_elective: Mapped[bool] = mapped_column(Boolean, default=False)

    plan = relationship("Plan", backref="plan_subjects")
    subject = relationship("Subject")


# --------------------------------------
# SUBJECT PREREQUISITE
# --------------------------------------
class SubjectPrerequisite(Base):
    __tablename__ = "subject_prerequisites"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    prereq_subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))

    subject = relationship("Subject", foreign_keys=[subject_id])
    prereq_subject = relationship("Subject", foreign_keys=[prereq_subject_id])


# --------------------------------------
# USER PROFILE
# --------------------------------------
class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    career_id: Mapped[int] = mapped_column(ForeignKey("careers.id"))
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"))

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    career = relationship("Career")
    plan = relationship("Plan")


# ENUM — debés tenerlo creado en Supabase exactamente con estos valores:
# CREATE TYPE subject_status AS ENUM ('aprobada','pendiente_final','desaprobada','sin_cursar');

# --------------------------------------
# USER SUBJECT
# --------------------------------------
class UserSubject(Base):
    __tablename__ = "user_subjects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String, index=True)
    plan_subject_id: Mapped[int] = mapped_column(ForeignKey("plan_subjects.id"))

    status: Mapped[str] = mapped_column(
        ENUM(
            "aprobada",
            "pendiente_final",
            "desaprobada",
            "sin_cursar",
            name="subject_status",
            create_type=False
        ),
        default="sin_cursar"
    )

    grade: Mapped[int | None] = mapped_column(Integer, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    plan_subject = relationship("PlanSubject")
