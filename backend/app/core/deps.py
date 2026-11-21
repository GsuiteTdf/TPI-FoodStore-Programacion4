from collections.abc import Callable
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(
    access_token: Annotated[str | None, Cookie(alias="access_token")] = None,
) -> Usuario:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión no válida")
    user_id = decode_access_token(access_token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión no válida")
    with session_factory() as session:
        user = session.get(Usuario, user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión no válida")
        session.expunge(user)
        return user


def get_current_active_user(user: Annotated[Usuario, Depends(get_current_user)]) -> Usuario:
    if user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return user


def require_role(roles: list[str]) -> Callable[..., Usuario]:
    def dependency(user: Annotated[Usuario, Depends(get_current_active_user)]) -> Usuario:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos para esta operación")
        return user

    return dependency
