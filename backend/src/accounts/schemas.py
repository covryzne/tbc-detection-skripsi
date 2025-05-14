import uuid
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from .security import hash_password, check_password

class UserCreate(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str
    is_admin: bool = False
    is_active: bool = True

    @validator("confirm_password")
    def passwords_match(cls, v, values, **kwargs):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v
    
    def hash_password(self) -> None:
        self.password = hash_password(self.password)

class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    is_admin: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    def check_password(self, password_in_db) -> bool:
        return check_password(self.password, password_in_db)

class TempUserRequest(BaseModel):
    name: str
    region: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None

    @validator('phone')
    def validate_phone(cls, v):
        if v and not v.replace('+', '').isdigit():
            raise ValueError('Nomor HP harus berupa angka')
        return v

    @validator('age')
    def validate_age(cls, v):
        if v is not None and (v < 0 or v > 150):
            raise ValueError('Umur harus antara 0 dan 150')
        return v