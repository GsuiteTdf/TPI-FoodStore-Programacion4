from fastapi import HTTPException, status

from app.core.database import session_factory
from app.core.security import hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.schemas import UserCreate, UserPublic


class UsuarioService:
    @staticmethod
    def _public(user: Usuario) -> UserPublic:
        return UserPublic.model_validate(user)

    def registrar(self, data: UserCreate) -> UserPublic:
        with session_factory() as session:
            repo = UsuarioRepository(session)
            username = data.username.strip()
            email = str(data.email).lower()
            if repo.get_by_username(username) is not None or repo.get_by_email(email) is not None:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El username o email ya existe")
            user = Usuario(
                username=username,
                full_name=data.full_name.strip(),
                email=email,
                hashed_password=hash_password(data.password),
                role="user",
                disabled=False,
            )
            repo.add(user)
            session.commit()
            session.refresh(user)
            return self._public(user)

    def autenticar(self, username: str, password: str) -> Usuario:
        with session_factory() as session:
            repo = UsuarioRepository(session)
            user = repo.get_by_username(username.strip())
            if user is None or not verify_password(password, user.hashed_password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
            if user.disabled:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
            session.expunge(user)
            return user

    def listar(self) -> list[UserPublic]:
        with session_factory() as session:
            repo = UsuarioRepository(session)
            return [self._public(u) for u in repo.list_all()]

    def activar(self, user_id: int) -> UserPublic:
        with session_factory() as session:
            user = session.get(Usuario, user_id)
            if user is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            user.disabled = False
            session.add(user)
            session.commit()
            session.refresh(user)
            return self._public(user)

    def desactivar(self, user_id: int, current_user_id: int) -> UserPublic:
        if user_id == current_user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El administrador no puede desactivarse a sí mismo")
        with session_factory() as session:
            user = session.get(Usuario, user_id)
            if user is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            user.disabled = True
            session.add(user)
            session.commit()
            session.refresh(user)
            return self._public(user)
