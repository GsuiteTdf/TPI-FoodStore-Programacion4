from sqlalchemy import func
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.core.fechas import inicio_del_dia_local_en_utc
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session) -> None:
        super().__init__(session, Pedido)

    def list_filtered(
        self,
        *,
        skip: int,
        limit: int,
        usuario_id: int | None,
        estado: str | None,
    ) -> tuple[int, list[Pedido]]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado:
            filtros.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count(Pedido.id)).where(*filtros)).one()
        statement = (
            select(Pedido)
            .where(*filtros)
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(statement).all())

    def summary_values(self) -> tuple[dict[str, int], int, float]:
        counts = {"PENDIENTE": 0, "EN_PREPARACION": 0, "ENTREGADO": 0, "CANCELADO": 0}
        por_estado = self.session.exec(
            select(Pedido.estado, func.count(Pedido.id)).group_by(Pedido.estado)
        ).all()
        for estado, cantidad in por_estado:
            if estado in counts:
                counts[estado] = cantidad
        pedidos_hoy = self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.created_at >= inicio_del_dia_local_en_utc())
        ).one()
        ingresos = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == "ENTREGADO")
        ).one()
        return counts, pedidos_hoy, float(ingresos)
