# src/patients/models.py
import uuid
import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
from src.database import Base

class GenderType(enum.Enum):
    male = "Male"
    female = "Female"
    other = "Other"

class Patient(Base):
    __tablename__ = "patients"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    name = Column(String, nullable=False)  # Bakal ditambah di DB
    age = Column(Integer)
    gender = Column(Enum(GenderType, name="gender_types"), nullable=True)
    phone = Column(String)
    address = Column(String)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relasi
    user = relationship("User", back_populates="patient")
    records = relationship("PatientRecord", back_populates="patient")

    def __repr__(self):
        return (
            f"<{self.__class__.__name__}("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"name={self.name}, "
            f"age={self.age}, "
            f"gender={self.gender}, "
            f"phone={self.phone}, "
            f"address={self.address})>"
        )

class PatientRecord(Base):
    __tablename__ = "patient_records"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    date = Column(TIMESTAMP, nullable=False, default=func.now())  # Ganti DateTime
    image_path = Column(String, nullable=True)
    result = Column(String, nullable=False)
    confidence = Column(String, nullable=True)
    inference_time = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="records")

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

patients = Patient.__table__
records = PatientRecord.__table__