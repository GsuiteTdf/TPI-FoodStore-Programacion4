from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session) -> None:
        super().__init__(session, Categoria)

    def list_active(self) -> list[Categoria]:
        statement = select(Categoria).where(Categoria.activo.is_(True)).order_by(Categoria.nombre)
        return list(self.session.exec(statement).all())

    def get_active(self, categoria_id: int) -> Categoria | None:
        statement = select(Categoria).where(Categoria.id == categoria_id, Categoria.activo.is_(True))
        return self.session.exec(statement).first()

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()
