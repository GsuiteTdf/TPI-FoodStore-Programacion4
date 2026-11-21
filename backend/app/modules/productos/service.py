from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoEncontrada(Exception):
    pass


class ProductoService:
    def __init__(self, uow_factory=ProductoUnitOfWork) -> None:
        self.uow_factory = uow_factory

    @staticmethod
    def _read(producto: Producto) -> ProductoRead:
        return ProductoRead.model_validate(producto)

    def listar(
        self,
        *,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow_factory() as uow:
            total, items = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(total=total, items=[self._read(p) for p in items])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow_factory() as uow:
            producto = uow.productos.get_active(producto_id)
            if producto is None:
                raise ProductoNoEncontrado
            return self._read(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow_factory() as uow:
            categoria = uow.categorias.get_active(data.categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada
            producto = Producto(**data.model_dump())
            uow.productos.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return self._read(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow_factory() as uow:
            producto = uow.productos.get_active(producto_id)
            if producto is None:
                raise ProductoNoEncontrado
            cambios = data.model_dump(exclude_unset=True)
            if "categoria_id" in cambios:
                categoria = uow.categorias.get_active(cambios["categoria_id"])
                if categoria is None:
                    raise CategoriaNoEncontrada
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return self._read(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow_factory() as uow:
            producto = uow.productos.get_active(producto_id)
            if producto is None:
                raise ProductoNoEncontrado
            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return self._read(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow_factory() as uow:
            producto = uow.productos.get_active(producto_id)
            if producto is None:
                raise ProductoNoEncontrado
            producto.activo = False
            uow.productos.add(producto)
