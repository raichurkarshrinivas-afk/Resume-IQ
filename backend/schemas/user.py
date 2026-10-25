"""
Pydantic schemas for User, Teacher, Profile, and Password Reset endpoints.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ── Request Schemas ──

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=150)


class TeacherRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=150)
    institution_name: str = Field(min_length=2, max_length=255)
    department: str = Field(min_length=2, max_length=150)
    designation: str | None = Field(default=None, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


# ── Response Schemas ──

class TeacherProfileOut(BaseModel):
    id: int
    institution_name: str
    department: str
    designation: str | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str = "candidate"
    is_active: bool = True
    teacher_profile: TeacherProfileOut | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MessageResponse(BaseModel):
    message: str
    success: bool = True
