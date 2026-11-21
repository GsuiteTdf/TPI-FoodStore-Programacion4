from app.modules.usuarios.models import Usuario
from app.modules.usuarios.service import UsuarioService


class AuthService:
    def __init__(self) -> None:
        self.users = UsuarioService()

    def authenticate(self, username: str, password: str) -> Usuario:
        return self.users.autenticar(username, password)
