from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.schemas import Message
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService()


def get_user_service() -> UsuarioService:
    return UsuarioService()


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: Annotated[UsuarioService, Depends(get_user_service)]) -> UserPublic:
    return service.registrar(data)


@router.post("/token", response_model=Message)
def login(
    response: Response,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> Message:
    user = service.authenticate(form.username, form.password)
    token, max_age = create_access_token(user.id or 0)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=max_age,
        path="/",
    )
    return Message(message="Login exitoso")


@router.post("/logout", response_model=Message)
def logout(response: Response) -> Message:
    response.delete_cookie(key="access_token", path="/", samesite="lax")
    return Message(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(user: Annotated[Usuario, Depends(get_current_active_user)]) -> UserPublic:
    return UserPublic.model_validate(user)
