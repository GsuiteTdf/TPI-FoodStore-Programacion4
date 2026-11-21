from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/api/v1/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


@router.get("", response_model=list[UserPublic])
def listar(
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
) -> list[UserPublic]:
    return service.listar()


@router.post("/{user_id}/activar", response_model=UserPublic)
def activar(
    user_id: int,
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
) -> UserPublic:
    return service.activar(user_id)


@router.post("/{user_id}/desactivar", response_model=UserPublic)
def desactivar(
    user_id: int,
    current_user: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
) -> UserPublic:
    return service.desactivar(user_id, current_user.id or 0)
