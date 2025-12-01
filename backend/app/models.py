from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as PgEnum
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import ENUM
from datetime import datetime
from .db import Base

from uuid import uuid4  # 👈 SOLO uuid4 para generar ids
from sqlalchemy.dialects.postgresql import UUID as PG_UUID  # 👈 tipo de columna Postgres
from uuid import UUID

import enum



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

    # 👇 NUEVO: relación inversa con UserSubject
    user_subjects = relationship("UserSubject", back_populates="plan_subject")




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

    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
    )
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
class SubjectStatus(str, enum.Enum):
    APROBADA = "aprobada"
    PENDIENTE_FINAL = "pendiente_final"
    DESAPROBADA = "desaprobada"
    SIN_CURSAR = "sin_cursar"


class UserSubject(Base):
    __tablename__ = "user_subjects"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("user_profiles.user_id"),
        nullable=False,
        index=True,
    )

    plan_subject_id = Column(
        Integer,
        ForeignKey("plan_subjects.id"),
        nullable=False,
        index=True,
    )

    status = Column(
        PgEnum(
            SubjectStatus,
            name="subject_status",
            create_type=False,
        ),
        nullable=True,
    )

    grade = Column(Integer, nullable=True)
    updated_at = Column(DateTime, nullable=True)

    plan_subject = relationship("PlanSubject", back_populates="user_subjects")


