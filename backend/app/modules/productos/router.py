from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from app.modules.productos.service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/api/v1/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService()


def translate_error(exc: Exception) -> HTTPException:
    if isinstance(exc, ProductoNoEncontrado):
        return HTTPException(status_code=404, detail="Producto no encontrado")
    if isinstance(exc, CategoriaNoEncontrada):
        return HTTPException(status_code=404, detail="Categoría no encontrada o inactiva")
    return HTTPException(status_code=500, detail="Error interno")


@router.get("", response_model=ProductosPaginados)
def listar(
    service: Annotated[ProductoService, Depends(get_producto_service)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None),
    disponible: bool | None = Query(default=None),
) -> ProductosPaginados:
    return service.listar(skip=skip, limit=limit, search=search, categoria_id=categoria_id, disponible=disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener(producto_id: int, service: Annotated[ProductoService, Depends(get_producto_service)]) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise translate_error(exc) from exc


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear(
    data: ProductoCreate,
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[ProductoService, Depends(get_producto_service)],
) -> ProductoRead:
    try:
        return service.crear(data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise translate_error(exc) from exc


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar(
    producto_id: int,
    data: ProductoUpdate,
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[ProductoService, Depends(get_producto_service)],
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise translate_error(exc) from exc


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[ProductoService, Depends(get_producto_service)],
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise translate_error(exc) from exc


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def eliminar(
    producto_id: int,
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[ProductoService, Depends(get_producto_service)],
) -> Response:
    try:
        service.eliminar(producto_id)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise translate_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
