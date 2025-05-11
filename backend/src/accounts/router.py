# src/accounts/router.py
import uuid
import json
import logging
from fastapi import APIRouter, HTTPException, Depends, Response, status
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel

from .models import User
from src.database import database
from src.patients.models import Patient
from .schemas import UserCreate, UserResponse, UserLogin, TempUserRequest
from .security import hash_password  # Tambah import

router = APIRouter()

class Settings(BaseModel):
    authjwt_secret_key: str = "secret"

@AuthJWT.load_config
def get_config():
    return Settings()

@router.post("/users/temp", status_code=status.HTTP_201_CREATED)
async def create_temp_user(request: TempUserRequest, Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = json.loads(Authorize.get_jwt_subject())

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
            "password": hash_password("temp_password"),  # Pakai hash_password dari security.py
            "is_active": True,
            "is_admin": False
        }
        query = User.__table__.insert().values(**user_data).returning(User.__table__)
        user = await database.fetch_one(query)

        patient_data = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "name": request.name,
            "address": request.region,
            "phone": request.phone,
            "gender": request.gender
        }
        query = Patient.__table__.insert().values(**patient_data).returning(Patient.__table__)
        await database.fetch_one(query)

        return {"message": "User sementara berhasil dibuat", "userId": user["id"]}
    except Exception as e:
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
def user(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    return {"user": json.loads(current_user)}

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
        logging.info(f"Creating user with email: {user.email}")
        query = User.__table__.insert().values(**user_dict).returning(User.__table__)
        data = await database.fetch_one(query)
        logging.info(f"User created: {data}")
        return {
            "id": data.id,
            "full_name": data.full_name,
            "email": data.email,
            "is_admin": data.is_admin,
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
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
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")