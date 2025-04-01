from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base user model"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., description="User email address")

    class Config:
        schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john.doe@example.com"
            }
        }

class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(..., min_length=6)

    class Config:
        schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john.doe@example.com",
                "password": "securepassword123"
            }
        }

class UserInDB(UserBase):
    """User model in database"""
    id: str
    password_hash: str
    created_at: datetime
    updated_at: datetime

class UserResponse(UserBase):
    """User response model"""
    id: str
    created_at: datetime

class UserLogin(BaseModel):
    """User login model"""
    username: str
    password: str

    class Config:
        schema_extra = {
            "example": {
                "username": "johndoe",
                "password": "securepassword123"
            }
        }

class TokenResponse(BaseModel):
    """Token response model"""
    token: str
    user: UserResponse