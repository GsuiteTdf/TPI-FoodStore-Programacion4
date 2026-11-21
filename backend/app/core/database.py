from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, echo=False, connect_args=connect_args)


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    # Importar modelos registra las tablas y relaciones en SQLModel.metadata.
    from app.modules.usuarios.models import Usuario  # noqa: F401
    from app.modules.categorias.models import Categoria  # noqa: F401
    from app.modules.productos.models import Producto  # noqa: F401
    from app.modules.pedidos.models import Pedido, DetallePedido  # noqa: F401

    SQLModel.metadata.create_all(engine)
