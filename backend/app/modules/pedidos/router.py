from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.service import (
    DatosPedidoInvalidos,
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/api/v1/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService()


def translate_error(exc: Exception) -> HTTPException:
    if isinstance(exc, PedidoNoEncontrado):
        return HTTPException(status_code=404, detail="Pedido no encontrado")
    if isinstance(exc, ProductoNoEncontrado):
        return HTTPException(status_code=404, detail="Producto no encontrado")
    if isinstance(exc, PedidoAjeno):
        return HTTPException(status_code=403, detail="El pedido pertenece a otro usuario")
    if isinstance(exc, StockInsuficiente):
        return HTTPException(status_code=400, detail="Stock insuficiente")
    if isinstance(exc, ProductoNoDisponible):
        return HTTPException(status_code=400, detail="Producto no disponible")
    if isinstance(exc, ProductoRepetido):
        return HTTPException(status_code=400, detail="No se puede repetir un producto en el pedido")
    if isinstance(exc, TransicionInvalida):
        return HTTPException(status_code=400, detail="Transición de estado inválida")
    if isinstance(exc, DatosPedidoInvalidos):
        return HTTPException(status_code=400, detail=str(exc))
    return HTTPException(status_code=500, detail="Error interno")


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear(
    data: PedidoCreate,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
) -> PedidoRead:
    try:
        return service.crear(current_user.id or 0, data)
    except (
        PedidoNoEncontrado,
        ProductoNoEncontrado,
        StockInsuficiente,
        ProductoNoDisponible,
        ProductoRepetido,
        DatosPedidoInvalidos,
    ) as exc:
        raise translate_error(exc) from exc


@router.get("", response_model=PedidosPaginados)
def listar(
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: str | None = Query(default=None),
) -> PedidosPaginados:
    try:
        return service.listar(
            usuario_id=current_user.id or 0,
            es_admin=current_user.role == "admin",
            skip=skip,
            limit=limit,
            estado=estado,
        )
    except DatosPedidoInvalidos as exc:
        raise translate_error(exc) from exc


@router.get("/resumen", response_model=ResumenPedidos)
def resumen(
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener(
    pedido_id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
) -> PedidoRead:
    try:
        return service.obtener(
            pedido_id,
            usuario_id=current_user.id or 0,
            es_admin=current_user.role == "admin",
        )
    except (PedidoNoEncontrado, PedidoAjeno) as exc:
        raise translate_error(exc) from exc


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int,
    data: CambioEstado,
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data)
    except (PedidoNoEncontrado, TransicionInvalida) as exc:
        raise translate_error(exc) from exc


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar(
    pedido_id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario_id=current_user.id or 0)
    except (PedidoNoEncontrado, PedidoAjeno, TransicionInvalida) as exc:
        raise translate_error(exc) from exc
