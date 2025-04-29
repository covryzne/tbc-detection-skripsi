import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
from src.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(ENUM("male", "female", "other", name="gender_types"), nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)

    user = relationship("User", back_populates="patient")
    records = relationship("PatientRecord", back_populates="patient", cascade="all, delete-orphan")

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return (
            f"<{self.__class__.__name__}("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"age={self.age})>"
        )


class PatientRecord(Base):
    __tablename__ = "patient_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    date = Column(DateTime, default=func.now(), nullable=False)
    image_path = Column(String, nullable=True)
    result = Column(String, nullable=False)  # "Positive" / "Negative"
    confidence = Column(String, nullable=True)
    inference_time = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="records")

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

patients = Patient.__table__
records = PatientRecord.__table__
