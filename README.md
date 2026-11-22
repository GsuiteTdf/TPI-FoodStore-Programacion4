# Food Store - Trabajo Práctico Integrador - Programación 4

Aplicación web completa para un negocio de comidas, desarrollada con FastAPI + SQLModel en el backend y React + TypeScript en el frontend. El modelo implementa el UML oficial del TPI: Usuario, Categoria, Producto, Pedido y DetallePedido, con relaciones 1:N, baja lógica de catálogo, copia de nombre/precio en las líneas de pedido y reglas transaccionales de stock.

## Enlaces de entrega

- Repositorio público de GitHub: https://github.com/GsuiteTdf/TPI-FoodStore-Programacion4
- Video público de demostración (10 a 15 minutos): https://drive.google.com/file/d/1gqhW-hKeACAt6ENgzLzvurhS6TOAPVGs/view?usp=sharing
- Youtube link (puede que lo borren por introducir email ficticio (doxing): https://youtu.be/DLYFevjmmDA

> Antes de entregar en Moodle, reemplazar obligatoriamente los dos valores anteriores por las URLs públicas definitivas.

## Requisitos

- Python 3.11 a 3.13.
- PostgreSQL 15 o superior (para desarrollo también puede usarse SQLite cambiando `DATABASE_URL`).
- Node.js 20.19 o superior.
- pnpm 9 o superior.

## Estructura

```text
backend/
  app/
    core/                 # configuración, BD, seguridad, deps, UoW y repositorio base
    modules/
      auth/
      usuarios/
      categorias/
      productos/
      pedidos/
    db/seed.py
  .env.example
  requirements.txt
frontend/
  src/
    shared/               # api, ui, layout y componentes transversales
    features/             # auth, categorias, productos, pedidos, usuarios
    store/                # authStore y cartStore (Zustand)
    routes/               # AppRouter y ProtectedRoute
  .env.example
  package.json
  pnpm-lock.yaml
README.md
```

## Backend

### Variables de entorno

Copiar:

```bash
cd backend
cp .env.example .env
```

Variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foodstore_db
SECRET_KEY=cambiar-esta-clave-de-al-menos-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

Para una prueba rápida con SQLite puede usarse:

```env
DATABASE_URL=sqlite:///./foodstore.db
```

### Instalación y ejecución

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.seed
uvicorn app.main:app --reload
```

API: `http://localhost:8000`

Documentación:

- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Usuario administrador del seed

- Usuario: `admin`
- Contraseña: `Admin1234!`
- Rol: `admin`

`python -m app.db.seed` es idempotente y carga/reactiva el administrador, al menos 3 categorías y 8 productos con stock.

## Frontend

### Variables de entorno

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Instalación, build y ejecución

```bash
cd frontend
pnpm install
pnpm build
pnpm dev
```

Frontend: `http://localhost:5173`

## Funcionalidades implementadas

### Cliente

- Registro e inicio de sesión con JWT en cookie HttpOnly.
- Catálogo público paginado en servidor, búsqueda y filtro por categoría.
- Skeleton y estado vacío.
- Carrito persistido con Zustand.
- Checkout con TanStack Form: dirección, forma de pago y notas.
- Creación transaccional de pedidos con descuento de stock.
- Consulta de pedidos propios.
- Cancelación de pedidos propios únicamente en `PENDIENTE`, restituyendo stock.

### Administrador

- Resumen con pendientes, en preparación, entregados, cancelados, pedidos del día e ingresos entregados.
- ABM de categorías con TanStack Table + TanStack Form y baja lógica.
- ABM de productos con TanStack Table + TanStack Form, stock y disponibilidad.
- Gestión de pedidos con la máquina de estados `PENDIENTE -> EN_PREPARACION -> ENTREGADO` y cancelación desde estados no terminales.
- Listado, activación y desactivación de usuarios; el administrador no puede desactivarse a sí mismo.

## Reglas principales del dominio

- Cada producto pertenece a una categoría mediante `categoria_id`.
- Un pedido tiene uno o más `DetallePedido`.
- Al crear un pedido se validan productos repetidos, existencia/actividad, disponibilidad y stock.
- El stock se descuenta dentro de la misma Unit of Work que crea el pedido y sus líneas.
- `DetallePedido` copia `nombre_producto` y `precio_unitario`; subtotal y total quedan fijos.
- Si falla cualquier validación, el UoW realiza rollback y no persiste cambios parciales.
- Al cancelar, el stock se restituye en la misma transacción que cambia el estado a `CANCELADO`.
- Los pedidos no se borran físicamente.
- Categorías y productos usan baja lógica con `activo = false`.

## Arquitectura y estado

Backend:

`Router -> Service -> UnitOfWork -> Repository -> Model`

En categorías, productos y pedidos el `commit`, `rollback` y `close` pertenecen exclusivamente a `UnitOfWork.__exit__`; Services y Routers no llaman a `session.commit()`.

Frontend:

- TanStack Query: datos del servidor, caché, mutaciones e invalidación.
- Zustand `authStore`: sesión; persiste sólo el usuario, nunca el JWT.
- Zustand `cartStore`: carrito persistido.
- Axios: `withCredentials: true` e interceptor de sesión.
- React Router: `ProtectedRoute` por sesión y rol.
- TypeScript con `strict: true`.
