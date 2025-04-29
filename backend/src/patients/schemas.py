import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None  # Gender bisa nullable atau kosong
    phone: Optional[str] = None
    address: Optional[str] = None


class PatientResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    age: Optional[int]
    gender: Optional[str]
    phone: Optional[str]
    address: Optional[str]

    @staticmethod
    def parse(data):
        """parses data"""
        def parse_one(data):
            return PatientResponse(**{
                "id": data.id,
                "user_id": data.user_id,
                "name": data.name,
                "age": data.age,
                "gender": data.gender,
                "phone": data.phone,
                "address": data.address,
            })
        if isinstance(data, list):
            return [parse_one(item) for item in data]
        return parse_one(data)


class PatientRecordCreate(BaseModel):
    id: uuid.UUID = None
    date: datetime = datetime.now()
    checkup_data: Optional[str] = None
    condition: Optional[str] = None
    patient_id: uuid.UUID = None


class PatientRecordResponse(BaseModel):
    id: uuid.UUID
    date: datetime
    checkup_data: Optional[str] = None
    condition: Optional[str] = None
    patient_id: uuid.UUID

    @staticmethod
    def parse(data):
        """parses data"""
        def parse_one(data):
            return PatientRecordResponse(**{
                "id": data.id,
                "date": data.date,
                "checkup_data": data.checkup_data,
                "condition": data.condition,
                "patient_id": data.patient_id,
            })
        if isinstance(data, list):
            return [parse_one(item) for item in data]
        return parse_one(data)
