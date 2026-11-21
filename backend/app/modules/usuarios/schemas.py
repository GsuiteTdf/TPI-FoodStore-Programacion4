from pydantic import EmailStr
from sqlmodel import Field, SQLModel

from app.core.fechas import UtcDatetime


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=100)
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: str
    disabled: bool
    created_at: UtcDatetime
