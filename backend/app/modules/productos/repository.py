from sqlalchemy import func
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session) -> None:
        super().__init__(session, Producto)

    def get_active(self, producto_id: int) -> Producto | None:
        statement = select(Producto).where(Producto.id == producto_id, Producto.activo.is_(True))
        return self.session.exec(statement).first()

    def search(
        self,
        *,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> tuple[int, list[Producto]]:
        filtros = [Producto.activo.is_(True)]
        if search:
            filtros.append(Producto.nombre.ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible.is_(disponible))
        total = self.session.exec(select(func.count(Producto.id)).where(*filtros)).one()
        statement = select(Producto).where(*filtros).order_by(Producto.nombre, Producto.id).offset(skip).limit(limit)
        return total, list(self.session.exec(statement).all())
