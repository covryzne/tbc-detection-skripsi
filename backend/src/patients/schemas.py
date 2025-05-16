import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
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
    date: datetime = datetime.now()
    image_path: Optional[str] = None
    result: str
    confidence: Optional[str] = None
    inference_time: Optional[str] = None
    patient_id: uuid.UUID

class PatientRecordResponse(BaseModel):
    id: uuid.UUID
    date: str  # Changed from datetime to str
    image_path: Optional[str]
    result: str
    confidence: Optional[str]
    inference_time: Optional[str]
    patient_id: uuid.UUID
    patient_name: str
    patient_age: Optional[int]
    patient_gender: Optional[str]
    patient_phone: Optional[str]
    patient_address: Optional[str]

    @staticmethod
    def parse(data):
        def parse_one(data):
            return PatientRecordResponse(**{
                "id": data.id,
                "date": data.date,
                "image_path": data.image_path,
                "result": data.result,
                "confidence": data.confidence,
                "inference_time": data.inference_time,
                "patient_id": data.patient_id,
                "patient_name": data.patient_name,
                "patient_age": data.patient_age,
                "patient_gender": data.patient_gender,
                "patient_phone": data.patient_phone,
                "patient_address": data.patient_address,
            })
        if isinstance(data, list):
            return [parse_one(item) for item in data]
        return parse_one(data)

class PredictionSaveRequest(BaseModel):
    userId: str
    status: str
    confidence: float
    details: str
    date: str
    fileName: str
    fileSize: int
    fileType: str
    analyzedAt: str
    name: Optional[str] = None
    region: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None