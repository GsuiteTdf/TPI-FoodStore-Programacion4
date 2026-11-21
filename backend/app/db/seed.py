from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario
from sqlmodel import select

CATEGORIAS = [
    ("Pizzas", "Pizzas artesanales"),
    ("Hamburguesas", "Hamburguesas y sandwiches"),
    ("Bebidas", "Bebidas sin alcohol"),
]

# Las imágenes están en frontend/public/img/productos (Vite las sirve desde la raíz del sitio).
# (nombre, imagen, descripción, precio, stock, categoría)
PRODUCTOS = [
    ("Pizza Muzzarella", "/img/productos/pizza-muzzarella.jpg", "Salsa de tomate y muzzarella", 8500.0, 20, "Pizzas"),
    ("Pizza Especial", "/img/productos/pizza-especial.jpg", "Jamón, morrones y muzzarella", 10200.0, 15, "Pizzas"),
    ("Pizza Napolitana", "/img/productos/pizza-napolitana.jpg", "Tomate, ajo y muzzarella", 9800.0, 12, "Pizzas"),
    ("Hamburguesa Clásica", "/img/productos/hamburguesa-clasica.jpg", "Carne, queso, lechuga y tomate", 7200.0, 25, "Hamburguesas"),
    ("Hamburguesa Doble", "/img/productos/hamburguesa-doble.jpg", "Doble carne y doble queso", 8900.0, 18, "Hamburguesas"),
    ("Papas Fritas", "/img/productos/papas-fritas.jpg", "Porción grande", 3900.0, 30, "Hamburguesas"),
    ("Gaseosa 500 ml", "/img/productos/gaseosa.jpg", "Bebida individual", 2200.0, 40, "Bebidas"),
    ("Agua Mineral", "/img/productos/agua-mineral.jpg", "Agua sin gas 500 ml", 1800.0, 35, "Bebidas"),
]


def seed() -> None:
    create_all_tables()
    with session_factory() as session:
        admin = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
        if admin is None:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
        else:
            admin.full_name = "Administrador Food Store"
            admin.email = "admin@foodstore.com"
            admin.hashed_password = hash_password("Admin1234!")
            admin.role = "admin"
            admin.disabled = False
            session.add(admin)

        categorias_por_nombre: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion, activo=True)
                session.add(categoria)
                session.flush()
            else:
                categoria.descripcion = descripcion
                categoria.activo = True
                session.add(categoria)
            categorias_por_nombre[nombre] = categoria

        for nombre, imagen, descripcion, precio, stock, categoria_nombre in PRODUCTOS:
            producto = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            categoria = categorias_por_nombre[categoria_nombre]
            if producto is None:
                producto = Producto(
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=imagen,
                    stock=stock,
                    disponible=True,
                    activo=True,
                    categoria_id=categoria.id or 0,
                )
            else:
                producto.descripcion = descripcion
                producto.precio_base = precio
                producto.imagen_url = imagen
                producto.stock = stock
                producto.disponible = True
                producto.activo = True
                producto.categoria_id = categoria.id or 0
            session.add(producto)

        session.commit()
    print("Seed completado: admin, 3 categorías y 8 productos.")


if __name__ == "__main__":
    seed()
