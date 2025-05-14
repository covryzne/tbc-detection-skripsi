import uuid
import json
import logging
from fastapi import APIRouter, HTTPException, Depends, Response, status
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel
from typing import List
from sqlalchemy import join, not_
from datetime import datetime

from .models import User
from src.database import database
from src.patients.models import Patient
from .schemas import UserCreate, UserResponse, UserLogin, TempUserRequest, UserProfileUpdate
from .security import hash_password

router = APIRouter()

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
        raise HTTPException(status_code=400, detail="Email does not exist.")
    if not user.check_password(existing_user.password):
        raise HTTPException(status_code=400, detail="Password mismatch.")

    data = {
        "id": str(existing_user.id),
        "email": existing_user.email,
        "is_admin": existing_user.is_admin,
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

        # Buat record Patient
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

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    logger.debug(f"Current user in delete_user: {current_user}")

    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa menghapus user")

    try:
        # Cek apakah user ada
        query = User.__table__.select().where(User.id == user_id)
        existing_user = await database.fetch_one(query)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        # Hapus record di patients yang terkait
        query = Patient.__table__.delete().where(Patient.user_id == user_id)
        await database.execute(query)
        logger.debug(f"Deleted patient records for user: {user_id}")

        # Hapus user
        query = User.__table__.delete().where(User.id == user_id)
        await database.execute(query)
        logger.debug(f"Deleted user: {user_id}")

        return {"message": "User berhasil dihapus"}
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat menghapus user: {str(e)}")

@router.patch("/users/me/profile")
async def update_profile(profile: UserProfileUpdate, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())
    user_id = current_user["id"]
    logger.debug(f"Updating profile for user: {user_id}")

    try:
        # Cek apakah user ada
        query = User.__table__.select().where(User.id == user_id)
        existing_user = await database.fetch_one(query)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        # Cek apakah patient ada, kalau belum bikin
        query = Patient.__table__.select().where(Patient.user_id == user_id)
        patient = await database.fetch_one(query)
        if not patient:
            patient_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": existing_user["full_name"],
                "address": "Tidak diketahui"
            }
            query = Patient.__table__.insert().values(**patient_data).returning(Patient.__table__)
            patient = await database.fetch_one(query)
            logger.debug(f"Created patient: {patient['id']} for user: {user_id}")

        # Update patient
        update_data = {}
        if profile.region is not None:
            update_data["address"] = profile.region
        if profile.age is not None:
            update_data["age"] = profile.age

        if update_data:
            query = Patient.__table__.update().where(Patient.user_id == user_id).values(**update_data)
            await database.execute(query)
            logger.debug(f"Updated patient profile for user: {user_id}")

        # Ambil data terbaru
        query = Patient.__table__.select().where(Patient.user_id == user_id)
        updated_patient = await database.fetch_one(query)

        return {
            "message": "Profile updated successfully",
            "region": updated_patient["address"] or "Tidak diketahui",
            "age": updated_patient["age"]
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}", exc_info=True)
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