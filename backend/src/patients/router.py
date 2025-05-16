import uuid
import json
import logging
from fastapi import APIRouter, HTTPException, Depends, status, Response
from fastapi_jwt_auth import AuthJWT
from typing import List, Optional
from datetime import datetime
from sqlalchemy.sql import cast, func
from sqlalchemy.types import String
from sqlalchemy import select
from pydantic import BaseModel

from .models import patients, Patient, records, PatientRecord
from src.accounts.models import User
from src.database import database
from .schemas import PatientCreate, PatientResponse, PatientRecordCreate, PatientRecordResponse

router = APIRouter()

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class PredictionSaveRequest(BaseModel):
    userId: Optional[str] = None
    status: str
    confidence: float
    details: str
    date: str
    fileName: str
    fileSize: int
    fileType: str
    name: Optional[str] = None
    region: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None

class PatientRecordUserResponse(BaseModel):
    id: str
    dateTime: str
    result: str
    confidence: str

async def create_temp_user_and_patient(
    user_id: str,
    name: str = "Temp User",
    region: str = "Unknown",
    phone: str = None,
    gender: str = None,
    age: int = None
):
    temp_user = {
        "id": str(uuid.uuid4()),
        "full_name": name,
        "email": f"temp_{user_id}@example.com",
        "password": hash_password("temp_password"),
        "is_active": False,
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
        "gender": gender,
        "age": age
    }
    query = patients.insert().values(**temp_patient).returning(patients)
    patient_data = await database.fetch_one(query)

    return user_data, patient_data

@router.post("/predictions/save", status_code=status.HTTP_201_CREATED)
async def save_prediction(request: PredictionSaveRequest, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in save_prediction: {current_user}")

    try:
        # Validasi gender
        valid_genders = ['male', 'female', 'other', None]
        if request.gender not in valid_genders:
            raise HTTPException(status_code=400, detail="Gender harus 'male', 'female', atau 'other'")

        # Kalo admin dan userId ada, bikin temp user/patient
        if current_user["is_admin"] and request.userId:
            try:
                uuid.UUID(request.userId)
            except ValueError:
                raise HTTPException(status_code=400, detail="userId harus berupa UUID yang valid")

            query = select(User.__table__).where(User.id == request.userId)
            user = await database.fetch_one(query)

            if not user:
                user, patient = await create_temp_user_and_patient(
                    request.userId,
                    name=request.name or "Temp User",
                    region=request.region or "Unknown",
                    phone=request.phone,
                    gender=request.gender,
                    age=request.age
                )
            else:
                query = select(patients).where(patients.c.user_id == user["id"])
                patient = await database.fetch_one(query)
                if not patient:
                    raise HTTPException(
                        status_code=400,
                        detail="Tidak ada pasien yang terkait dengan user ini"
                    )
        else:
            # User biasa: Pake current_user["id"]
            query = select(patients).where(patients.c.user_id == current_user["id"])
            patient = await database.fetch_one(query)

            if not patient:
                patient_data = {
                    "id": str(uuid.uuid4()),
                    "user_id": current_user["id"],
                    "name": current_user.get("full_name", "Unknown User"),
                    "address": request.region or "Unknown",
                    "phone": request.phone,
                    "gender": request.gender,
                    "age": request.age
                }
                query = patients.insert().values(**patient_data).returning(patients)
                patient = await database.fetch_one(query)

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
        logger.error(f"Error menyimpan prediksi: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error menyimpan prediksi: {str(e)}")

@router.get("/patients/", status_code=status.HTTP_200_OK, response_model=List[PatientResponse])
async def get_patients(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in get_patients: {user}")

    query = patients.select().where(Patient.doctor_id == user["id"])
    datas = await database.fetch_all(query)

    return PatientResponse.parse(datas)

@router.get("/patients/{patient_id}", status_code=status.HTTP_200_OK, response_model=PatientResponse)
async def get_patients(patient_id: str, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in get_patients by ID: {user}")
    
    if user["is_admin"] is False and user["id"] != patient_id:
        raise HTTPException(status_code=403, detail="You are not allowed to access this patient's data.")
    
    try:
        query = patients.select().where(Patient.id == patient_id)
        patient = await database.fetch_one(query)
    except Exception as e:
        logger.error(f"Error fetching patient: {str(e)}", exc_info=True)
        raise HTTPException(status_code=404, detail=str(e))

    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient with {patient_id} not found")
    return PatientResponse.parse(patient)

@router.post("/patients/", status_code=status.HTTP_201_CREATED, response_model=PatientResponse)
async def create_patient(patient: PatientCreate, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in create_patient: {user}")

    patient.id = uuid.uuid4()
    patient.doctor_id = user["id"]
    query = patients.insert().values(**patient.dict()).returning(patients)
    data = await database.fetch_one(query)
    return PatientResponse.parse(data)

@router.get("/patient/records", status_code=status.HTTP_200_OK, response_model=List[PatientRecordResponse])
async def get_all_records(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in get_all_records: {current_user}")

    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa melihat semua riwayat")

    try:
        await database.execute("SELECT 1")
        logger.debug("Database connection successful")

        # Cek kolom di tabel patient_records
        columns = await database.fetch_all("SELECT column_name FROM information_schema.columns WHERE table_name = 'patient_records'")
        column_names = [col['column_name'] for col in columns]
        logger.debug(f"Columns in patient_records table: {column_names}")

        if 'created_at' not in column_names:
            logger.error("Column 'created_at' not found in patient_records table")
            raise HTTPException(status_code=500, detail="Column 'created_at' not found in patient_records table")

        query = (
            records.join(patients, records.c.patient_id == patients.c.id)
            .select()
            .with_only_columns(
                records.c.id,
                records.c.patient_id,
                func.to_char(records.c.created_at, "Mon DD, YYYY HH24:MI").label("date"),
                records.c.image_path,
                records.c.result,
                records.c.confidence,
                records.c.inference_time,
                patients.c.name.label("patient_name"),
                patients.c.age.label("patient_age"),
                cast(patients.c.gender, String).label("patient_gender"),
                patients.c.phone.label("patient_phone"),
                patients.c.address.label("patient_address")
            )
        )
        logger.debug(f"Executing query: {str(query)}")
        records_data = await database.fetch_all(query)
        logger.debug(f"Records fetched: {len(records_data)} records")
        
        try:
            response = PatientRecordResponse.parse(records_data)
            logger.debug("Successfully parsed records to PatientRecordResponse")
            return response
        except Exception as parse_error:
            logger.error(f"Error parsing records to PatientRecordResponse: {str(parse_error)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Error parsing response: {str(parse_error)}")
            
    except Exception as e:
        logger.error(f"Error mengambil riwayat: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error mengambil riwayat: {str(e)}")

@router.get("/patient/{patient_id}/records", status_code=status.HTTP_200_OK, response_model=List[PatientRecordResponse])
async def get_patient_records(patient_id: str, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in get_patient_records: {user}")

    try:
        query = records.select().where(PatientRecord.patient_id == patient_id)
        datas = await database.fetch_all(query)
        return PatientRecordResponse.parse(datas)
    except Exception as e:
        logger.error(f"Error fetching patient records: {str(e)}", exc_info=True)
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/patient/{patient_id}/records/{record_id}", status_code=status.HTTP_200_OK, response_model=PatientRecordResponse)
async def get_patient_records(patient_id: str, record_id: str, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in get_patient_records by ID: {user}")

    try:
        query = records.select().where(PatientRecord.patient_id == patient_id, PatientRecord.id == record_id)
        record = await database.fetch_one(query)
        return PatientRecordResponse.parse(record)
    except Exception as e:
        logger.error(f"Error fetching patient record: {str(e)}", exc_info=True)
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/patient/{patient_id}/records", status_code=status.HTTP_200_OK, response_model=PatientRecordResponse)
async def create_patient(patient_id: str, patient_record: PatientRecordCreate, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in create_patient_record: {user}")
    
    try:
        patient_record.id = uuid.uuid4()
        patient_record.patient_id = patient_id
        query = records.insert().values(**patient_record.dict()).returning(records)
        data = await database.fetch_one(query)
        return PatientRecordResponse.parse(data)
    except Exception as e:
        logger.error(f"Error creating patient record: {str(e)}", exc_info=True)
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/patient-records/me", response_model=List[PatientRecordUserResponse])
async def get_user_patient_records(
    search: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[str] = None,  # Ubah ke str
    date_to: Optional[str] = None,    # Ubah ke str
    page: int = 1,
    limit: int = 8,
    Authorize: AuthJWT = Depends()
):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    user_id = current_user["id"]
    logger.debug(f"Fetching patient records for user: {user_id}")

    try:
        # Query dengan join
        query = (
            select(PatientRecord.__table__)
            .join(Patient, Patient.id == PatientRecord.patient_id)
            .join(User, User.id == Patient.user_id)
            .where(User.id == user_id)
        )

        # Filter search
        if search:
            query = query.where(PatientRecord.result.ilike(f"%{search}%"))

        # Filter status
        if status in ("positive", "negative"):
            query = query.where(PatientRecord.result == status.capitalize())

        # Filter date range
        parsed_date_from = None
        parsed_date_to = None
        if date_from:
            try:
                parsed_date_from = datetime.strptime(date_from, "%Y-%m-%d")
                query = query.where(PatientRecord.date >= parsed_date_from)
            except ValueError:
                raise HTTPException(status_code=400, detail="Format date_from harus YYYY-MM-DD")
        if date_to:
            try:
                parsed_date_to = datetime.strptime(date_to, "%Y-%m-%d")
                query = query.where(PatientRecord.date <= parsed_date_to)
            except ValueError:
                raise HTTPException(status_code=400, detail="Format date_to harus YYYY-MM-DD")

        # Hitung total item
        count_query = query.with_only_columns(func.count()).order_by(None)
        total_items = await database.fetch_val(count_query)

        # Pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)

        # Eksekusi query
        records = await database.fetch_all(query)

        # Format response
        response = [
            {
                "id": str(record["id"]),
                "dateTime": record["date"].strftime("%b %d, %Y %H:%M"),
                "result": record["result"],
                "confidence": f"{record['confidence']}%"
            }
            for record in records
        ]

        # Tambah header X-Total-Count
        headers = {"X-Total-Count": str(total_items)}
        return Response(content=json.dumps(response), media_type="application/json", headers=headers)
    except Exception as e:
        logger.error(f"Error fetching patient records: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Terjadi kesalahan pada server.")