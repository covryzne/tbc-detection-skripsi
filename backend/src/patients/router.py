import uuid
import json
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi_jwt_auth import AuthJWT
from typing import List
from datetime import datetime

from .models import patients, Patient, records, PatientRecord
from src.accounts.models import User
from src.database import database
from .schemas import PatientCreate, PatientResponse, PatientRecordCreate, PatientRecordResponse, PredictionSaveRequest

router = APIRouter()

async def create_temp_user_and_patient(
    user_id: str, name: str = "Temp User", region: str = "Unknown", phone: str = None, gender: str = None
):
    temp_user = {
        "id": str(uuid.uuid4()),
        "full_name": name,
        "email": f"temp_{user_id}@example.com",
        "password": "temp_password",
        "is_active": True,
        "is_admin": False
    }
    query = User.__table__.insert().values(**temp_user).returning(User.__table__)
    user_data = await database.fetch_one(query)

    temp_patient = {
        "id": str(uuid.uuid4()),
        "user_id": user_data["id"],
        "name": name,
        "address": region,
        "phone": phone,
        "gender": gender
    }
    query = patients.insert().values(**temp_patient).returning(patients)
    patient_data = await database.fetch_one(query)

    return user_data, patient_data

@router.post("/predictions/save", status_code=status.HTTP_201_CREATED)
async def save_prediction(request: PredictionSaveRequest, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())

    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa menyimpan prediksi")

    try:
        try:
            uuid.UUID(request.userId)
        except ValueError:
            raise HTTPException(status_code=400, detail="userId harus berupa UUID yang valid")

        valid_genders = ['male', 'female', 'other', None]
        if request.gender not in valid_genders:
            raise HTTPException(status_code=400, detail="Gender harus 'male', 'female', atau 'other'")

        query = User.__table__.select().where(User.id == request.userId)
        user = await database.fetch_one(query)

        if not user:
            user, patient = await create_temp_user_and_patient(
                request.userId,
                name=request.name or "Temp User",
                region=request.region or "Unknown",
                phone=request.phone,
                gender=request.gender
            )
        else:
            query = patients.select().where(Patient.user_id == user["id"])
            patient = await database.fetch_one(query)
            if not patient:
                raise HTTPException(
                    status_code=400,
                    detail="Tidak ada pasien yang terkait dengan user ini"
                )

        try:
            record_date = datetime.strptime(request.date, "%m/%d/%Y")
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Format tanggal salah. Harus MM/DD/YYYY"
            )

        patient_record = {
            "id": str(uuid.uuid4()),
            "patient_id": patient["id"],
            "date": record_date,
            "image_path": request.fileName,
            "result": request.status.capitalize(),
            "confidence": str(request.confidence),
            "inference_time": (
                request.details.split("Inference time: ")[1]
                if "Inference time" in request.details
                else "Unknown"
            ),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        query = records.insert().values(**patient_record).returning(records)
        data = await database.fetch_one(query)

        return {"message": "Hasil prediksi berhasil disimpan"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error menyimpan prediksi: {str(e)}")

@router.get("/patients/", status_code=status.HTTP_200_OK, response_model=List[PatientResponse])
async def get_patients(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())

    query = patients.select().where(Patient.doctor_id == user["id"])
    datas = await database.fetch_all(query)

    return PatientResponse.parse(datas)

@router.get("/patients/{patient_id}", status_code=status.HTTP_200_OK, response_model=PatientResponse)
async def get_patients(patient_id: str, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())
    
    if user["is_admin"] is False and user["id"] != patient_id:
        raise HTTPException(status_code=403, detail="You are not allowed to access this patient's data.")
    
    try:
        query = patients.select().where(Patient.id == patient_id)
        patient = await database.fetch_one(query)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient with {patient_id} not found")
    return PatientResponse.parse(patient)

@router.post("/patients/", status_code=status.HTTP_201_CREATED, response_model=PatientResponse)
async def create_patient(patient: PatientCreate, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())

    patient.id = uuid.uuid4()
    patient.doctor_id = user["id"]
    query = patients.insert().values(**patient.dict()).returning(patients)
    data = await database.fetch_one(query)
    return PatientResponse.parse(data)

@router.get("/patient/{patient_id}/records", status_code=status.HTTP_200_OK, response_model=List[PatientRecordResponse])
async def get_patient_records(patient_id: str, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())

    try:
        query = records.select().where(PatientRecord.patient_id == patient_id)
        datas = await database.fetch_all(query)
        return PatientRecordResponse.parse(datas)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/patient/{patient_id}/records/{record_id}", status_code=status.HTTP_200_OK, response_model=PatientRecordResponse)
async def get_patient_records(patient_id: str, record_id: str, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())

    try:
        query = records.select().where(PatientRecord.patient_id == patient_id, PatientRecord.id == record_id)
        record = await database.fetch_one(query)
        return PatientRecordResponse.parse(record)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/patient/{patient_id}/records", status_code=status.HTTP_200_OK, response_model=PatientRecordResponse)
async def create_patient(patient_id: str, patient_record: PatientRecordCreate, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())
    try:
        patient_record.id = uuid.uuid4()
        patient_record.patient_id = patient_id
        query = records.insert().values(**patient_record.dict()).returning(records)
        data = await database.fetch_one(query)
        return PatientRecordResponse.parse(data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))