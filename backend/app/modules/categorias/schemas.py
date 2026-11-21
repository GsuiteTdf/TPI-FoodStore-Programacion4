from pydantic import field_validator
from sqlmodel import Field, SQLModel


def _rechazar_null(valor):
    if valor is None:
        raise ValueError("No puede ser null; omití el campo si no querés modificarlo")
    return valor


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = ""


class CategoriaUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None

    validar_sin_null = field_validator("nombre", "descripcion")(_rechazar_null)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool
