import uuid
import json
import logging
from fastapi import APIRouter, HTTPException, Depends, Response, status
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel, validator
from typing import Optional, List
from sqlalchemy import func, case, and_, extract, select, cast, Numeric, Integer
from sqlalchemy.sql.expression import not_
from datetime import datetime, timedelta

from .models import User, UserProfile
from src.database import database
from src.patients.models import Patient, PatientRecord
from .schemas import UserCreate, UserResponse, UserLogin, TempUserRequest, UserProfileUpdate, UserUpdate, PatientProfileResponse, PatientProfileUpdate
from .security import hash_password

router = APIRouter()

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Define tables
records = PatientRecord.__table__
patients = Patient.__table__

class Settings(BaseModel):
    authjwt_secret_key: str = "secret"

@AuthJWT.load_config
def get_config():
    return Settings()

@router.post("/users/temp", status_code=status.HTTP_201_CREATED)
async def create_temp_user(request: TempUserRequest, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in create_temp_user: {current_user}")

    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa membuat user sementara")

    valid_genders = ['male', 'female', 'other', None]
    if request.gender not in valid_genders:
        raise HTTPException(status_code=400, detail="Gender harus 'male', 'female', atau 'other'")

    try:
        user_data = {
            "id": str(uuid.uuid4()),
            "full_name": request.name,
            "email": f"temp_{uuid.uuid4()}@example.com",
            "password": hash_password("temp_password"),
            "is_active": False,
            "is_admin": False
        }
        query = User.__table__.insert().values(**user_data).returning(User.__table__)
        user = await database.fetch_one(query)
        logger.debug(f"Created temp user: {user['id']}")

        patient_data = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "name": request.name,
            "address": request.region or "Tidak diketahui",
            "phone": request.phone,
            "gender": request.gender,
            "age": request.age
        }
        query = Patient.__table__.insert().values(**patient_data).returning(Patient.__table__)
        patient = await database.fetch_one(query)
        logger.debug(f"Created patient for temp user: {patient['id']}")

        return {"message": "User sementara berhasil dibuat", "userId": user["id"]}
    except Exception as e:
        logger.error(f"Error membuat user sementara: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error membuat user sementara: {str(e)}")

@router.post('/token')
async def login(user: UserLogin, Authorize: AuthJWT = Depends(), response: Response = None):
    query = User.__table__.select().where(User.email == user.email)
    existing_user = await database.fetch_one(query)
    if not existing_user:
        raise HTTPException(status_code=400, detail="Email tidak ditemukan.")
    if not user.check_password(existing_user.password):
        raise HTTPException(status_code=400, detail="Password salah.")

    data = {
        "id": str(existing_user.id),
        "full_name": existing_user.full_name,
        "email": existing_user.email,
        "is_admin": existing_user.is_admin,
        "created_at": existing_user.created_at.isoformat()
    }
    access_token = Authorize.create_access_token(subject=json.dumps(data))

    response.set_cookie(
        key="auth_token",
        value=access_token,
        httponly=True,
        max_age=1800,
        path="/",
        secure=False,
        samesite="lax"
    )

    return {"access_token": access_token}

@router.get("/users/me")
async def get_current_user(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"JWT payload: {current_user}")

    # Fetch user data from database
    query = User.__table__.select().where(User.id == current_user["id"])
    user = await database.fetch_one(query)
    
    if not user:
        logger.error(f"User not found in database for ID: {current_user['id']}")
        raise HTTPException(status_code=404, detail="User not found")

    # Cast Record to dict for safety
    user_dict = dict(user)
    
    # Format response for frontend
    response_data = {
        "id": str(user_dict["id"]),  # UUID to string
        "full_name": user_dict["full_name"],
        "email": user_dict["email"],
        "is_admin": user_dict["is_admin"],
        "created_at": user_dict["created_at"].isoformat(),
        "updated_at": user_dict["updated_at"].isoformat()
    }
    logger.debug(f"Returning user data: {response_data}")
    return response_data

@router.patch("/users/me")
async def update_user(
    update_data: UserUpdate,
    Authorize: AuthJWT = Depends()
):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    user_id = current_user["id"]
    logger.debug(f"Updating user for ID: {user_id}, payload: {update_data.dict()}")

    # Fetch user from database
    query = User.__table__.select().where(User.id == user_id)
    user = await database.fetch_one(query)
    
    if not user:
        logger.error(f"User not found in database for ID: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")

    # Prepare update data
    update_dict = update_data.dict(exclude_unset=True)
    if not update_dict:
        logger.debug(f"No fields to update for user ID: {user_id}")
        user_dict = dict(user)
        return {
            "id": str(user_dict["id"]),
            "full_name": user_dict["full_name"],
            "email": user_dict["email"],
            "is_admin": user_dict["is_admin"],
            "created_at": user_dict["created_at"].isoformat(),
            "updated_at": user_dict["updated_at"].isoformat()
        }

    # Validate email uniqueness
    if "email" in update_dict and update_dict["email"] != user["email"]:
        email_query = User.__table__.select().where(User.email == update_dict["email"])
        existing_user = await database.fetch_one(email_query)
        if existing_user:
            logger.error(f"Email {update_dict['email']} already in use")
            raise HTTPException(status_code=400, detail="Email sudah digunakan")

    # Handle password update
    if "password" in update_dict:
        hashed_password = hash_password(update_dict["password"])
        update_dict["password"] = hashed_password
        del update_dict["confirm_password"]  # Remove confirm_password from update

    # Set updated_at
    update_dict["updated_at"] = func.now()

    # Update user
    update_query = (
        User.__table__.update()
        .where(User.id == user_id)
        .values(**update_dict)
        .returning(User.__table__)
    )
    updated_user = await database.fetch_one(update_query)

    if not updated_user:
        logger.error(f"Failed to update user for ID: {user_id}")
        raise HTTPException(status_code=500, detail="Failed to update user")

    # Format response
    user_dict = dict(updated_user)
    response_data = {
        "id": str(user_dict["id"]),
        "full_name": user_dict["full_name"],
        "email": user_dict["email"],
        "is_admin": user_dict["is_admin"],
        "created_at": user_dict["created_at"].isoformat(),
        "updated_at": user_dict["updated_at"].isoformat()
    }
    logger.debug(f"User updated, returning user data: {response_data}")
    return response_data


@router.get("/patients/me", response_model=PatientProfileResponse)
async def get_patient_profile(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    user_id = current_user["id"]
    logger.debug(f"Fetching patient profile for user_id: {user_id}")

    try:
        # Fetch user to get full_name
        user_query = User.__table__.select().where(User.id == user_id)
        user = await database.fetch_one(user_query)
        if not user:
            logger.error(f"No user found for user_id: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch patient profile
        query = patients.select().where(patients.c.user_id == user_id)
        patient = await database.fetch_one(query)

        # If no patient record, create one
        if not patient:
            logger.debug(f"No patient record found for user_id: {user_id}, creating new patient")
            patient_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": user["full_name"] or "Unknown",
                "address": "Tidak diketahui",
                "age": None,
                "gender": None,
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
            }
            insert_query = patients.insert().values(**patient_data).returning(patients)
            patient = await database.fetch_one(insert_query)
            logger.debug(f"Created patient record for user_id: {user_id}, patient_id: {patient['id']}")

        response = {
            "name": patient["name"],
            "phone": patient["phone"],
            "address": patient["address"],
            "age": patient["age"],
            "gender": patient["gender"].value if patient["gender"] is not None else None,
        }
        logger.debug(f"Patient profile fetched: {response}")
        return response
    except Exception as e:
        logger.error(f"Error fetching patient profile: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@router.patch("/patients/me", response_model=PatientProfileResponse)
async def update_patient_profile(update: PatientProfileUpdate, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    user_id = current_user["id"]
    logger.debug(f"Updating patient profile for user_id: {user_id}, payload: {update.dict()}")

    try:
        # Fetch user to get full_name
        user_query = User.__table__.select().where(User.id == user_id)
        user = await database.fetch_one(user_query)
        if not user:
            logger.error(f"No user found for user_id: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch patient profile
        query = patients.select().where(patients.c.user_id == user_id)
        patient = await database.fetch_one(query)

        # If no patient record, create one
        if not patient:
            logger.debug(f"No patient record found for user_id: {user_id}, creating new patient")
            patient_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": user["full_name"] or "Unknown",
                "address": "Tidak diketahui",
                "age": None,
                "gender": None,
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
            }
            insert_query = patients.insert().values(**patient_data).returning(patients)
            patient = await database.fetch_one(insert_query)
            logger.debug(f"Created patient record for user_id: {user_id}, patient_id: {patient['id']}")

        # Update patient profile
        update_data = update.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = func.now()
            query = (
                patients.update()
                .where(patients.c.user_id == user_id)
                .values(**update_data)
                .returning(patients)
            )
            updated_patient = await database.fetch_one(query)

            response = {
                "name": updated_patient["name"],
                "phone": updated_patient["phone"],
                "address": updated_patient["address"],
                "age": updated_patient["age"],
                "gender": updated_patient["gender"].value if updated_patient["gender"] is not None else None,
            }
            logger.debug(f"Patient profile updated: {response}")
            return response
        else:
            return {
                "name": patient["name"],
                "phone": patient["phone"],
                "address": patient["address"],
                "age": patient["age"],
                "gender": patient["gender"].value if patient["gender"] is not None else None,
            }
    except Exception as e:
        logger.error(f"Error updating patient profile: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@router.get("/users/", response_model=List[UserResponse])
async def get_users(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in get_users: {current_user}")

    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa melihat daftar user")

    try:
        query = (
            User.__table__
            .join(Patient.__table__, User.id == Patient.user_id, isouter=True)
            .select()
            .where(
                (User.is_active == True) &
                (not_(User.email.ilike('temp_%@example.com')))
            )
        )
        users = await database.fetch_all(query)
        logger.debug(f"Users fetched: {len(users)} users")
        return [
            {
                "id": user["id"],
                "full_name": user["full_name"],
                "email": user["email"],
                "is_admin": user["is_admin"],
                "created_at": user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"],
                "region": user["address"] or "Unknown"
            }
            for user in users
        ]
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Terjadi kesalahan pada server.")

@router.post("/users/", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def create_user(user: UserCreate):
    try:
        query = User.__table__.select().where(User.email == user.email)
        existing_user = await database.fetch_one(query)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email sudah digunakan.")
        user.hash_password()
        user_dict = user.dict()
        user_dict.pop("confirm_password")
        logger.info(f"Creating user with email: {user.email}")
        query = User.__table__.insert().values(**user_dict).returning(User.__table__)
        data = await database.fetch_one(query)

        patient_data = {
            "id": str(uuid.uuid4()),
            "user_id": data["id"],
            "name": user.full_name,
            "address": "Tidak diketahui"
        }
        query = Patient.__table__.insert().values(**patient_data).returning(Patient.__table__)
        patient = await database.fetch_one(query)
        logger.debug(f"Created patient: {patient['id']} for user: {data['id']}")

        return {
            "id": data.id,
            "full_name": data.full_name,
            "email": data.email,
            "is_admin": data.is_admin,
            "created_at": data.created_at.isoformat() if isinstance(data.created_at, datetime) else data.created_at,
            "region": patient["address"] or "Tidak diketahui"
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Terjadi kesalahan pada server.")

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user: UserCreate, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in update_user: {current_user}")

    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa mengubah user")

    query = User.__table__.select().where(User.id == user_id)
    existing_user = await database.fetch_one(query)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    user_dict = user.dict(exclude_unset=True)
    if user_dict.get("password"):
        user_dict["password"] = hash_password(user_dict["password"])
    user_dict.pop("confirm_password", None)

    query = User.__table__.update().where(User.id == user_id).values(**user_dict)
    await database.execute(query)

    query = Patient.__table__.select().where(Patient.user_id == user_id)
    patient = await database.fetch_one(query)

    query = User.__table__.select().where(User.id == user_id)
    updated_user = await database.fetch_one(query)

    return {
        "id": updated_user["id"],
        "full_name": updated_user["full_name"],
        "email": updated_user["email"],
        "is_admin": updated_user["is_admin"],
        "created_at": updated_user["created_at"].isoformat() if isinstance(updated_user["created_at"], datetime) else updated_user["created_at"],
        "region": patient["address"] if patient else "Tidak diketahui"
    }

@router.get("/users/", response_model=List[UserResponse])
async def get_users(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in get_users: {current_user}")

    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa melihat daftar user")

    try:
        query = (
            User.__table__
            .join(Patient.__table__, User.id == Patient.user_id, isouter=True)
            .select()
            .where(
                (User.is_active == True) &
                (not_(User.email.ilike('temp_%@example.com')))
            )
        )
        users = await database.fetch_all(query)
        logger.debug(f"Users fetched: {len(users)} users")
        return [
            {
                "id": user["id"],
                "full_name": user["full_name"],
                "email": user["email"],
                "is_admin": user["is_admin"],
                "created_at": user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"],
                "region": user["address"] or "Tidak diketahui"
            }
            for user in users
        ]
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Terjadi kesalahan pada server.")

@router.get("/dashboard", response_model=dict)
async def get_dashboard_data(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    user_id = current_user["id"]
    is_admin = current_user["is_admin"]

    try:
        # Ambil full_name dari tabel users
        user_query = select(User.full_name).where(User.id == user_id)
        full_name = await database.fetch_val(user_query)
        if not full_name:
            full_name = "User"  # Fallback kalau full_name null

        # Data buat User dan Admin
        # 1. Total Detections
        logger.debug("Running total_detections_query")
        total_detections_query = (
            select(func.count())
            .select_from(records)
            .join(patients, records.c.patient_id == patients.c.id)
            .where(patients.c.user_id == user_id if not is_admin else True)
        )
        total_detections = await database.fetch_val(total_detections_query)
        logger.debug(f"Total detections: {total_detections}")

        # 2. Positive Cases
        logger.debug("Running positive_cases_query")
        positive_cases_query = (
            select(func.count())
            .select_from(records)
            .join(patients, records.c.patient_id == patients.c.id)
            .where(
                (records.c.result == "Positive") &
                (patients.c.user_id == user_id if not is_admin else True)
            )
        )
        positive_cases = await database.fetch_val(positive_cases_query)
        logger.debug(f"Positive cases: {positive_cases}")

        # 3. Recent Activity
        logger.debug("Running recent_activity_query")
        if is_admin:
            recent_activity_query = (
                select(
                    User.id.label("userId"),
                    User.full_name.label("user"),
                    func.to_char(records.c.created_at, "Mon DD, YYYY HH24:MI").label("date"),
                    patients.c.address.label("region"),
                    records.c.result,
                    records.c.confidence
                )
                .select_from(
                    records.join(patients, records.c.patient_id == patients.c.id)
                    .join(User.__table__, patients.c.user_id == User.id)
                )
                .order_by(records.c.created_at.desc())
                .limit(3)
            )
            recent_activity = await database.fetch_all(recent_activity_query)
            recent_activity = [
                {
                    "userId": str(row["userId"]),
                    "user": row["user"],
                    "date": row["date"],
                    "region": row["region"] or "Unknown",
                    "result": row["result"],
                    "confidence": row["confidence"],
                }
                for row in recent_activity
            ]
        else:
            recent_activity_query = (
                select(
                    records.c.id,
                    func.to_char(records.c.created_at, "Mon DD, YYYY HH24:MI").label("date"),
                    records.c.result,
                    records.c.confidence
                )
                .select_from(
                    records.join(patients, records.c.patient_id == patients.c.id)
                )
                .where(patients.c.user_id == user_id)
                .order_by(records.c.created_at.desc())
                .limit(3)
            )
            recent_activity = await database.fetch_all(recent_activity_query)
            recent_activity = [
                {
                    "id": str(row["id"]),
                    "date": row["date"],
                    "result": row["result"],
                    "confidence": row["confidence"],
                }
                for row in recent_activity
            ]
        logger.debug(f"Recent activity: {recent_activity}")

        # Data khusus Admin
        if is_admin:
            # 4. Inference Time Average
            logger.debug("Running inference_time_query")
            inference_time_query = select(
                func.avg(
                    func.cast(
                        func.regexp_replace(
                            func.trim(records.c.inference_time),
                            '\s*ms$',
                            ''
                        ),
                        Numeric
                    )
                )
            ).where(records.c.inference_time.isnot(None))
            inference_time_avg = await database.fetch_val(inference_time_query)
            inference_time_avg = f"{float(inference_time_avg):.1f}ms" if inference_time_avg else "N/A"
            logger.debug(f"Inference time avg: {inference_time_avg}")

            # 5. Active Users
            logger.debug("Running active_users_query")
            active_users_query = select(func.count()).select_from(User.__table__).where(User.is_active == True)
            active_users = await database.fetch_val(active_users_query)
            logger.debug(f"Active users: {active_users}")

            # 6. Detection Data (trend bulanan, 6 bulan terakhir)
            logger.debug("Running detection_data_query")
            raw_query = """
                SELECT
                    to_char(date, 'Mon') AS month,
                    COUNT(*) AS detections,
                    SUM(CASE WHEN result = 'Positive' THEN 1 ELSE 0 END) AS positives
                FROM patient_records
                GROUP BY to_char(date, 'Mon')
            """
            detection_data = await database.fetch_all(raw_query)
            month_order = {
                "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
                "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
            }
            detection_data = sorted(
                [
                    {
                        "month": row["month"],
                        "detections": row["detections"],
                        "positives": row["positives"],
                    }
                    for row in detection_data
                ],
                key=lambda x: month_order.get(x["month"], 0),
                reverse=True
            )[:6]
            logger.debug(f"Detection data: {detection_data}")

            # 7. Regional Data
            logger.debug("Running regional_data_query")
            raw_query = """
                SELECT
                    patients.address AS region,
                    COUNT(*) AS detections,
                    SUM(CASE WHEN patient_records.result = 'Positive' THEN 1 ELSE 0 END) AS positives
                FROM patient_records
                JOIN patients ON patient_records.patient_id = patients.id
                GROUP BY patients.address
                ORDER BY COUNT(*) DESC
                LIMIT 10
            """
            regional_data = await database.fetch_all(raw_query)
            regional_data = [
                {
                    "region": row["region"] or "Unknown",
                    "detections": row["detections"],
                    "positives": row["positives"],
                }
                for row in regional_data
            ]
            logger.debug(f"Regional data: {regional_data}")

            # 8. Trends
            logger.debug("Running trend queries")
            prev_month_detections_query = (
                select(func.count())
                .select_from(records)
                .where(
                    (records.c.created_at >= datetime.now() - timedelta(days=60)) &
                    (records.c.created_at < datetime.now() - timedelta(days=30))
                )
            )
            prev_month_detections = await database.fetch_val(prev_month_detections_query)
            detections_trend = (
                f"+{((total_detections - prev_month_detections) / prev_month_detections * 100):.1f}% from last month"
                if prev_month_detections > 0
                else "+0% from last month"
            )

            prev_month_positives_query = (
                select(func.count())
                .select_from(records)
                .where(
                    (records.c.created_at >= datetime.now() - timedelta(days=60)) &
                    (records.c.created_at < datetime.now() - timedelta(days=30)) &
                    (records.c.result == "Positive")
                )
            )
            prev_month_positives = await database.fetch_val(prev_month_positives_query)
            positives_trend = (
                f"+{((positive_cases - prev_month_positives) / prev_month_positives * 100):.1f}% from last month"
                if prev_month_positives > 0
                else "+0% from last month"
            )

            prev_month_users_query = (
                select(func.count())
                .select_from(User.__table__)
                .where(
                    (User.is_active == True) &
                    (User.created_at >= datetime.now() - timedelta(days=60)) &
                    (User.created_at < datetime.now() - timedelta(days=30))
                )
            )
            prev_month_users = await database.fetch_val(prev_month_users_query)
            users_trend = (
                f"+{((active_users - prev_month_users) / prev_month_users * 100):.1f}% from last month"
                if prev_month_users > 0
                else "+0% from last month"
            )

            inference_trend = "+5% from last month"

            return {
                "fullName": full_name,
                "summaryCards": [
                    {
                        "title": "Total Detections",
                        "value": str(total_detections),
                        "description": "All-time TB detection scans",
                        "iconType": "analysis",
                        "trend": detections_trend,
                        "trendUp": total_detections >= prev_month_detections,
                    },
                    {
                        "title": "Positive Cases",
                        "value": str(positive_cases),
                        "description": "Detected TB positive cases",
                        "iconType": "lungs",
                        "trend": positives_trend,
                        "trendUp": positive_cases >= prev_month_positives,
                    },
                    {
                        "title": "Inference Time Average",
                        "value": inference_time_avg,
                        "description": "Average time for TB detection",
                        "iconType": "chart",
                        "trend": inference_trend,
                        "trendUp": True,
                    },
                    {
                        "title": "Active Users",
                        "value": str(active_users),
                        "description": "Users utilizing TB detection",
                        "iconType": "users",
                        "trend": users_trend,
                        "trendUp": active_users >= prev_month_users,
                    },
                ],
                "detectionData": detection_data,
                "regionalData": regional_data,
                "recentActivity": recent_activity,
            }
        else:
            # Data buat User
            positive_percentage = (
                f"{(positive_cases / total_detections * 100):.1f}%"
                if total_detections > 0
                else "0%"
            )
            return {
                "fullName": full_name,
                "summaryCards": [
                    {
                        "title": "Total Predictions",
                        "value": str(total_detections),
                        "description": "Your all-time TB detection scans",
                        "iconType": "analysis",
                        "trend": "",
                        "trendUp": True,
                    },
                    {
                        "title": "Positive Cases",
                        "value": str(positive_cases),
                        "description": "Your detected TB positive cases",
                        "iconType": "lungs",
                        "trend": positive_percentage + " of total",
                        "trendUp": positive_cases > 0,
                    },
                ],
                "recentActivity": recent_activity,
            }
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Terjadi kesalahan pada server")

@router.get("/patients/me", response_model=PatientProfileResponse)
async def get_patient_profile(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    user_id = current_user["id"]
    logger.debug(f"Fetching patient profile for user_id: {user_id}")

    try:
        # Fetch user to get full_name
        user_query = select(User.full_name).where(User.id == user_id)
        user = await database.fetch_one(user_query)
        if not user:
            logger.error(f"No user found for user_id: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch patient profile
        query = patients.select().where(patients.c.user_id == user_id)
        patient = await database.fetch_one(query)

        # If no patient record, create one
        if not patient:
            logger.debug(f"No patient record found for user_id: {user_id}, creating new patient")
            patient_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": user["full_name"] or "Unknown",
                "address": "Tidak diketahui",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
            }
            insert_query = patients.insert().values(**patient_data).returning(patients)
            patient = await database.fetch_one(insert_query)
            logger.debug(f"Created patient record for user_id: {user_id}, patient_id: {patient['id']}")

        response = {
            "name": patient["name"],
            "phone": patient["phone"],
            "address": patient["address"],
        }
        logger.debug(f"Patient profile fetched: {response}")
        return response
    except Exception as e:
        logger.error(f"Error fetching patient profile: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@router.patch("/patients/me", response_model=PatientProfileResponse)
async def update_patient_profile(update: PatientProfileUpdate, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    user_id = current_user["id"]
    logger.debug(f"Updating patient profile for user_id: {user_id}, payload: {update.dict()}")

    try:
        # Fetch user to get full_name
        user_query = select(User.full_name).where(User.id == user_id)
        user = await database.fetch_one(user_query)
        if not user:
            logger.error(f"No user found for user_id: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch patient profile
        query = patients.select().where(patients.c.user_id == user_id)
        patient = await database.fetch_one(query)

        # If no patient record, create one
        if not patient:
            logger.debug(f"No patient record found for user_id: {user_id}, creating new patient")
            patient_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": user["full_name"] or "Unknown",
                "address": "Tidak diketahui",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
            }
            insert_query = patients.insert().values(**patient_data).returning(patients)
            patient = await database.fetch_one(insert_query)
            logger.debug(f"Created patient record for user_id: {user_id}, patient_id: {patient['id']}")

        # Update patient profile
        update_data = update.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = func.now()
            query = (
                patients.update()
                .where(patients.c.user_id == user_id)
                .values(**update_data)
                .returning(patients)
            )
            updated_patient = await database.fetch_one(query)

            response = {
                "name": updated_patient["name"],
                "phone": updated_patient["phone"],
                "address": updated_patient["address"],
            }
            logger.debug(f"Patient profile updated: {response}")
            return response
        else:
            return {
                "name": patient["name"],
                "phone": patient["phone"],
                "address": patient["address"],
            }
    except Exception as e:
        logger.error(f"Error updating patient profile: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="auth_token", path="/")
    return {"message": "Logged out successfully"}

@router.get("/test-db")
async def test_db_connection():
    try:
        result = await database.fetch_one("SELECT 1")
        if result:
            return {"message": "Database connection successful 🎉"}
        return {"message": "Connected, but got no result"}
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")