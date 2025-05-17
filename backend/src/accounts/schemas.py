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
    created_at: str
    # region: str  # Dihapus karena nggak dipake di ProfilePage.tsx

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
    gender: Optional[str] = None

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
    
    @validator('gender')
    def validate_gender(cls, v):
        if v is not None and v not in ["Male", "Female", "Other"]:
            raise ValueError('Gender harus Male atau Female atau Other')
        return v

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        if v and not v.replace('+', '').isdigit():
            raise ValueError('Nomor HP harus berupa angka')
        return v

class PasswordUpdate(BaseModel):
    password: str
    confirm_password: str

    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v

    @validator("password")
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    confirm_password: Optional[str] = None

    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v

    @validator("password")
    def password_length(cls, v):
        if v and len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v
    
class PatientProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None

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

    @validator('gender')
    def validate_gender(cls, v):
        if v is not None and v not in ["male", "female", "other"]:
            raise ValueError('Gender harus male, female, atau other')
        return v

class PatientProfileResponse(BaseModel):
    name: str
    phone: Optional[str]
    address: Optional[str]
    age: Optional[int]
    gender: Optional[str]