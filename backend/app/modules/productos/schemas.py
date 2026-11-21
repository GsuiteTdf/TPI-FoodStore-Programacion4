from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


def _rechazar_null(valor):
    if valor is None:
        raise ValueError("No puede ser null; omití el campo si no querés modificarlo")
    return valor


class ProductoCreate(SQLModel):
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str = ""
    precio_base: float = Field(ge=0)
    imagen_url: str = ""
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int


class ProductoUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=150)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = None

    validar_sin_null = field_validator(
        "nombre", "descripcion", "precio_base", "imagen_url", "stock", "disponible", "categoria_id"
    )(_rechazar_null)


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
