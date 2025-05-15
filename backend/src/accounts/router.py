import uuid
import json
import logging
from fastapi import APIRouter, HTTPException, Depends, Response, status
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel
from typing import List
from sqlalchemy import func, case, and_, extract, select, cast, Numeric, Integer
from sqlalchemy.sql.expression import not_
from datetime import datetime, timedelta

from .models import User, UserProfile
from src.database import database
from src.patients.models import Patient, PatientRecord
from .schemas import UserCreate, UserResponse, UserLogin, TempUserRequest, UserProfileUpdate
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

@router.get('/users/me')
async def user(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    return {"user": json.loads(current_user)}

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
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa akses dashboard")

    try:
        # 1. Summary Cards
        logger.debug("Running total_detections_query")
        total_detections_query = select(func.count()).select_from(records)
        total_detections = await database.fetch_val(total_detections_query)
        logger.debug(f"Total detections: {total_detections}")

        logger.debug("Running positive_cases_query")
        positive_cases_query = select(func.count()).select_from(records).where(records.c.result == "Positive")
        positive_cases = await database.fetch_val(positive_cases_query)
        logger.debug(f"Positive cases: {positive_cases}")

        logger.debug("Running inference_time_query")
        inference_time_query = select(
            func.avg(
                cast(
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

        logger.debug("Running active_users_query")
        active_users_query = select(func.count()).select_from(User.__table__).where(User.is_active == True)
        active_users = await database.fetch_val(active_users_query)
        logger.debug(f"Active users: {active_users}")

        # 2. Detection Data (trend bulanan, 6 bulan terakhir)
        try:
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
        except Exception as e:
            logger.error(f"Error in detection_data_query: {str(e)}", exc_info=True)
            raise

        # 3. Regional Data
        try:
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
        except Exception as e:
            logger.error(f"Error in regional_data_query: {str(e)}", exc_info=True)
            raise

        # 4. Recent Activity
        try:
            logger.debug("Running recent_activity_query")
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
            logger.debug(f"Recent activity: {recent_activity}")
        except Exception as e:
            logger.error(f"Error in recent_activity_query: {str(e)}", exc_info=True)
            raise

        # 5. Trends
        try:
            logger.debug("Running prev_month_detections_query")
            prev_month_detections_query = (
                select(func.count())
                .select_from(records)
                .where(
                    and_(
                        records.c.created_at >= datetime.now() - timedelta(days=60),
                        records.c.created_at < datetime.now() - timedelta(days=30)
                    )
                )
            )
            prev_month_detections = await database.fetch_val(prev_month_detections_query)
            detections_trend = (
                f"+{((total_detections - prev_month_detections) / prev_month_detections * 100):.1f}% from last month"
                if prev_month_detections > 0
                else "+0% from last month"
            )
            logger.debug(f"Detections trend: {detections_trend}")
        except Exception as e:
            logger.error(f"Error in prev_month_detections_query: {str(e)}", exc_info=True)
            raise

        try:
            logger.debug("Running prev_month_positives_query")
            prev_month_positives_query = (
                select(func.count())
                .select_from(records)
                .where(
                    and_(
                        records.c.created_at >= datetime.now() - timedelta(days=60),
                        records.c.created_at < datetime.now() - timedelta(days=30),
                        records.c.result == "Positive"
                    )
                )
            )
            prev_month_positives = await database.fetch_val(prev_month_positives_query)
            positives_trend = (
                f"+{((positive_cases - prev_month_positives) / prev_month_positives * 100):.1f}% from last month"
                if prev_month_positives > 0
                else "+0% from last month"
            )
            logger.debug(f"Positives trend: {positives_trend}")
        except Exception as e:
            logger.error(f"Error in prev_month_positives_query: {str(e)}", exc_info=True)
            raise

        try:
            logger.debug("Running prev_month_users_query")
            prev_month_users_query = (
                select(func.count())
                .select_from(User.__table__)
                .where(
                    and_(
                        User.is_active == True,
                        User.created_at >= datetime.now() - timedelta(days=60),
                        User.created_at < datetime.now() - timedelta(days=30)
                    )
                )
            )
            prev_month_users = await database.fetch_val(prev_month_users_query)
            users_trend = (
                f"+{((active_users - prev_month_users) / prev_month_users * 100):.1f}% from last month"
                if prev_month_users > 0
                else "+0% from last month"
            )
            logger.debug(f"Users trend: {users_trend}")
        except Exception as e:
            logger.error(f"Error in prev_month_users_query: {str(e)}", exc_info=True)
            raise

        inference_trend = "+5% from last month"

        return {
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
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Terjadi kesalahan pada server")

@router.get("/users/me/profile-details")
async def get_profile_details(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    user_id = current_user["id"]
    logger.debug(f"Fetching profile details for user: {user_id}")

    try:
        query = UserProfile.__table__.select().where(UserProfile.user_id == user_id)
        profile = await database.fetch_one(query)
        if not profile:
            return {"phone": None, "address": None}
        return {
            "phone": profile["phone"],
            "address": profile["address"]
        }
    except Exception as e:
        logger.error(f"Error fetching profile details: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Terjadi kesalahan pada server.")

@router.patch("/users/me/profile-details")
async def update_profile_details(profile: UserProfileUpdate, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    user_id = current_user["id"]
    logger.debug(f"Updating profile details for user: {user_id}")

    try:
        query = User.__table__.select().where(User.id == user_id)
        existing_user = await database.fetch_one(query)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        query = UserProfile.__table__.select().where(UserProfile.user_id == user_id)
        existing_profile = await database.fetch_one(query)

        update_data = {}
        if profile.phone is not None:
            update_data["phone"] = profile.phone
        if profile.address is not None:
            update_data["address"] = profile.address

        if update_data:
            if existing_profile:
                query = (
                    UserProfile.__table__.update()
                    .where(UserProfile.user_id == user_id)
                    .values(**update_data)
                )
                await database.execute(query)
                logger.debug(f"Updated existing profile for user: {user_id}")
            else:
                query = (
                    UserProfile.__table__.insert()
                    .values(user_id=user_id, **update_data)
                )
                await database.execute(query)
                logger.debug(f"Created new profile for user: {user_id}")

        query = UserProfile.__table__.select().where(UserProfile.user_id == user_id)
        updated_profile = await database.fetch_one(query)
        return {
            "message": "Profile details updated successfully",
            "phone": updated_profile["phone"] if updated_profile else None,
            "address": updated_profile["address"] if updated_profile else None
        }
    except Exception as e:
        logger.error(f"Error updating profile details: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Terjadi kesalahan pada server.")

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