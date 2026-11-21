from app.core.fechas import utc_now
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    DetallePedidoRead,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

ESTADOS = {"PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"}
TRANSICIONES = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}
FORMAS_PAGO = {"EFECTIVO", "TRANSFERENCIA"}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class DatosPedidoInvalidos(Exception):
    pass


class PedidoService:
    def __init__(self, uow_factory=PedidoUnitOfWork) -> None:
        self.uow_factory = uow_factory

    @staticmethod
    def _read(pedido: Pedido) -> PedidoRead:
        return PedidoRead(
            id=pedido.id or 0,
            usuario_id=pedido.usuario_id,
            estado=pedido.estado,
            forma_pago=pedido.forma_pago,
            direccion_entrega=pedido.direccion_entrega,
            notas=pedido.notas,
            total=pedido.total,
            created_at=pedido.created_at,
            updated_at=pedido.updated_at,
            items=[
                DetallePedidoRead(
                    producto_id=item.producto_id,
                    nombre_producto=item.nombre_producto,
                    precio_unitario=item.precio_unitario,
                    cantidad=item.cantidad,
                    subtotal=item.subtotal,
                )
                for item in pedido.items
            ],
        )

    @staticmethod
    def _validar_datos(data: PedidoCreate) -> None:
        if data.forma_pago not in FORMAS_PAGO:
            raise DatosPedidoInvalidos("La forma de pago debe ser EFECTIVO o TRANSFERENCIA")
        if not 5 <= len(data.direccion_entrega.strip()) <= 200:
            raise DatosPedidoInvalidos("La dirección de entrega debe tener entre 5 y 200 caracteres")
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido

    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        self._validar_datos(data)
        with self.uow_factory() as uow:
            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega.strip(),
                notas=data.notas.strip() if data.notas else None,
                total=0,
            )
            uow.pedidos.add(pedido)
            uow.session.flush()

            total = 0.0
            for item_data in data.items:
                producto = uow.productos.get_active(item_data.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado
                if not producto.disponible:
                    raise ProductoNoDisponible
                if producto.stock < item_data.cantidad:
                    raise StockInsuficiente

                producto.stock -= item_data.cantidad
                uow.productos.add(producto)
                subtotal = round(producto.precio_base * item_data.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id or 0,
                    producto_id=producto.id or 0,
                    cantidad=item_data.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.session.add(detalle)
                total += subtotal

            pedido.total = round(total, 2)
            pedido.updated_at = utc_now()
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return self._read(pedido)

    def listar(
        self,
        *,
        usuario_id: int,
        es_admin: bool,
        skip: int,
        limit: int,
        estado: str | None,
    ) -> PedidosPaginados:
        if estado is not None and estado not in ESTADOS:
            raise DatosPedidoInvalidos("Estado de pedido inválido")
        with self.uow_factory() as uow:
            total, pedidos = uow.pedidos.list_filtered(
                skip=skip,
                limit=limit,
                usuario_id=None if es_admin else usuario_id,
                estado=estado,
            )
            return PedidosPaginados(total=total, items=[self._read(p) for p in pedidos])

    def obtener(self, pedido_id: int, *, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow_factory() as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno
            return self._read(pedido)

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        nuevo_estado = data.estado
        if nuevo_estado not in ESTADOS:
            raise TransicionInvalida
        with self.uow_factory() as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado
            if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
                raise TransicionInvalida
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            pedido.updated_at = utc_now()
            uow.pedidos.add(pedido)
            uow.session.flush()
            return self._read(pedido)

    def cancelar(self, pedido_id: int, *, usuario_id: int) -> PedidoRead:
        with self.uow_factory() as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = utc_now()
            uow.pedidos.add(pedido)
            uow.session.flush()
            return self._read(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow_factory() as uow:
            counts, pedidos_hoy, ingresos = uow.pedidos.summary_values()
            return ResumenPedidos(
                pendientes=counts["PENDIENTE"],
                en_preparacion=counts["EN_PREPARACION"],
                entregados=counts["ENTREGADO"],
                cancelados=counts["CANCELADO"],
                pedidos_hoy=pedidos_hoy,
                ingresos_entregados=round(ingresos, 2),
            )
