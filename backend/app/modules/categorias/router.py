from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/api/v1/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService()


def translate_error(exc: Exception) -> HTTPException:
    if isinstance(exc, CategoriaNoEncontrada):
        return HTTPException(status_code=404, detail="Categoría no encontrada")
    if isinstance(exc, NombreDuplicado):
        return HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")
    return HTTPException(status_code=500, detail="Error interno")


@router.get("", response_model=list[CategoriaRead])
def listar(service: Annotated[CategoriaService, Depends(get_categoria_service)]) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener(categoria_id: int, service: Annotated[CategoriaService, Depends(get_categoria_service)]) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except (CategoriaNoEncontrada, NombreDuplicado) as exc:
        raise translate_error(exc) from exc


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear(
    data: CategoriaCreate,
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
) -> CategoriaRead:
    try:
        return service.crear(data)
    except (CategoriaNoEncontrada, NombreDuplicado) as exc:
        raise translate_error(exc) from exc


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar(
    categoria_id: int,
    data: CategoriaUpdate,
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except (CategoriaNoEncontrada, NombreDuplicado) as exc:
        raise translate_error(exc) from exc


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def eliminar(
    categoria_id: int,
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
) -> Response:
    try:
        service.eliminar(categoria_id)
    except (CategoriaNoEncontrada, NombreDuplicado) as exc:
        raise translate_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
