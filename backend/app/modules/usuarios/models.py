from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.core.fechas import utc_now

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, max_length=100)
    full_name: str = Field(max_length=150)
    email: str = Field(index=True, unique=True, max_length=254)
    hashed_password: str
    role: str = Field(default="user", max_length=20)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
