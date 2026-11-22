# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación a Distancia (UTN).

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos (efectivo o transferencia); el administrador gestiona categorías, productos, stock, pedidos y usuarios. El modelo implementa el UML oficial del TPI: `Usuario`, `Categoria`, `Producto`, `Pedido` y `DetallePedido`.

- **Repositorio:** https://github.com/GsuiteTdf/TPI-FoodStore-Programacion4
- **Video de demostración (Google Drive):** https://drive.google.com/file/d/1gqhW-hKeACAt6ENgzLzvurhS6TOAPVGs/view?usp=sharing
- **Video de demostración (YouTube, copia alternativa):** https://youtu.be/DLYFevjmmDA
- **Alumno:** Gastón Cejas
- **Comisión:** 4 · TUPaD - UTN

## Stack

| Parte    | Tecnologías                                                                                                                   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Backend  | Python 3.11–3.13, FastAPI, SQLModel, PostgreSQL (o SQLite en desarrollo), JWT en cookie HttpOnly, passlib + bcrypt            |
| Frontend | React 19, TypeScript (strict), Vite 7, Tailwind CSS 4, TanStack Query / Form / Table, React Router 7, Zustand, Axios          |

## Requisitos

- **Python 3.11, 3.12 o 3.13**
- **PostgreSQL 15+**, o **Docker Desktop** para levantarlo con un comando (para desarrollo también se acepta SQLite, ver más abajo)
- **Node.js 20.19+** y **pnpm 9+** (`npm install -g pnpm`)

## Estructura

```
.
├── backend/              API REST FastAPI
│   ├── app/core/         configuración, base de datos, seguridad, dependencias, Unit of Work y repositorio base
│   ├── app/modules/      auth, usuarios, categorias, productos, pedidos (models, schemas, repository, service, router)
│   ├── app/db/seed.py    datos iniciales
│   ├── .env.example
│   └── requirements.txt
├── frontend/             SPA React + TypeScript organizada por features
│   ├── src/features/     auth, categorias, productos, pedidos, usuarios
│   ├── src/shared/       api (Axios), ui, layout y componentes comunes
│   ├── src/store/        authStore, cartStore y toastStore (Zustand)
│   ├── src/routes/       AppRouter y ProtectedRoute
│   ├── public/img/       imágenes de los productos
│   └── .env.example
├── docker-compose.yml    PostgreSQL listo para usar (opcional)
└── README.md
```

## Backend

### 1. Instalación

```bash
cd backend
python -m venv .venv
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1
# Windows (cmd)
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Variables de entorno

Copiar el ejemplo y ajustar:

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable                      | Descripción                          | Ejemplo                                                      |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| `DATABASE_URL`                | Conexión a la base                   | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY`                  | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres`               |
| `ALGORITHM`                   | Algoritmo del JWT                    | `HS256`                                                      |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie  | `30`                                                         |
| `FRONTEND_ORIGIN`             | Origen permitido por CORS            | `http://localhost:5173`                                      |

**Base de datos PostgreSQL** (elegir una opción):

- Con Docker (no requiere instalar PostgreSQL). Desde la raíz del proyecto:

  ```bash
  docker compose up -d db
  ```

  Crea `foodstore_db` con usuario `postgres` / `postgres` en `localhost:5432`, que coincide con `.env.example`.

  > Si ya tenés PostgreSQL instalado escuchando en el puerto 5432, el contenedor no puede usarlo. Creá un archivo `.env` en la raíz con `DB_HOST_PORT=5433`, volvé a ejecutar `docker compose up -d db` y en `backend/.env` usá `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/foodstore_db`.

- Con PostgreSQL instalado localmente: crear la base y ajustar usuario/contraseña en `DATABASE_URL`:

  ```bash
  psql -U postgres -c "CREATE DATABASE foodstore_db;"
  ```

**Alternativa SQLite (sin instalar PostgreSQL):** en `.env` usar `DATABASE_URL=sqlite:///./foodstore.db`.

### 3. Datos iniciales (seed)

```bash
python -m app.db.seed
```

Crea las tablas y carga los datos iniciales (es idempotente: se puede correr varias veces):

| Usuario | Contraseña   | Rol   |
| ------- | ------------ | ----- |
| `admin` | `Admin1234!` | admin |

Además, 3 categorías (Pizzas, Hamburguesas y Bebidas) y 8 productos con stock e imagen. Los clientes se crean desde la pantalla de registro.

### 4. Ejecución

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación Swagger: http://localhost:8000/docs
- Documentación ReDoc: http://localhost:8000/redoc

## Frontend

### 1. Instalación

```bash
cd frontend
pnpm install
```

### 2. Variables de entorno

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable       | Descripción        | Ejemplo                        |
| -------------- | ------------------ | ------------------------------ |
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

### 3. Ejecución

```bash
pnpm build   # verifica tipos y genera dist/
pnpm dev     # http://localhost:5173
```

> **Importante:** abrir el frontend en `http://localhost:5173` (no `127.0.0.1`). La sesión viaja en una cookie HttpOnly que solo se comparte entre orígenes del mismo sitio (`localhost`).

## Funcionalidades

**Cliente:** registro e inicio de sesión · catálogo paginado en el servidor con búsqueda y filtro por categoría · carrito persistido en el navegador · checkout con dirección, forma de pago y notas · "Mis pedidos" con detalle, seguimiento del estado y cancelación en estado PENDIENTE.

**Administrador:** resumen con indicadores (pendientes, en preparación, entregados, cancelados, pedidos del día e ingresos) · ABM de categorías y productos con baja lógica (incluye stock y disponibilidad) · gestión de pedidos según la máquina de estados · activación y desactivación de usuarios (el administrador no puede desactivarse a sí mismo).

### Reglas de negocio

| Regla | Descripción                                                                                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | El pedido se crea en una transacción: valida productos (activos, disponibles, con stock, sin repetir), descuenta stock y copia nombre y precio en cada línea. Si algo falla, no se guarda nada. |
| RN-02 | Estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`; `PENDIENTE` y `EN_PREPARACION` pueden pasar a `CANCELADO`. `ENTREGADO` y `CANCELADO` son terminales.                                         |
| RN-03 | Cancelar restituye el stock en la misma transacción.                                                                                                                                            |
| RN-04 | El cliente ve y cancela solo sus pedidos (solo en PENDIENTE); el admin ve todos y los avanza o cancela.                                                                                         |
| RN-05 | Las líneas y el total de un pedido no cambian después de crearlo.                                                                                                                               |
| RN-06 | `forma_pago`: EFECTIVO o TRANSFERENCIA; `direccion_entrega`: 5 a 200 caracteres.                                                                                                                |

### Arquitectura

- **Backend:** `Router → Service → Unit of Work → Repository → Model`. En categorías, productos y pedidos el `commit`, `rollback` y `close` ocurren solo en el `__exit__` del Unit of Work; ningún Service ni Router llama a `session.commit()`. Categorías y productos usan baja lógica (`activo = false`) y los pedidos nunca se borran.
- **Frontend:** TanStack Query para los datos del servidor (caché, mutaciones e invalidación) · Zustand para la sesión (`authStore`, persiste solo el usuario, nunca el JWT) y el carrito (`cartStore`) · Axios con `withCredentials` e interceptor de 401 · `ProtectedRoute` por sesión y rol · TypeScript con `strict: true`.

## Endpoints principales (`/api/v1`)

| Método                      | Ruta                                                                                 | Acceso        |
| --------------------------- | ------------------------------------------------------------------------------------ | ------------- |
| POST                        | `/auth/register`, `/auth/token`, `/auth/logout`                                      | Público       |
| GET                         | `/auth/me`                                                                           | Sesión        |
| GET / POST                  | `/admin/usuarios`, `/admin/usuarios/{id}/activar`, `/admin/usuarios/{id}/desactivar` | admin         |
| GET                         | `/categorias`, `/categorias/{id}`                                                    | Público       |
| POST / PUT / DELETE         | `/categorias`, `/categorias/{id}`                                                    | admin         |
| GET                         | `/productos?skip&limit&search&categoria_id&disponible`, `/productos/{id}`            | Público       |
| POST / PUT / PATCH / DELETE | `/productos`, `/productos/{id}`, `/productos/{id}/stock`                             | admin         |
| POST / GET                  | `/pedidos`                                                                           | Sesión        |
| GET                         | `/pedidos/resumen`                                                                   | admin         |
| GET                         | `/pedidos/{id}`                                                                      | Dueño o admin |
| PATCH                       | `/pedidos/{id}/estado`                                                               | admin         |
| PATCH                       | `/pedidos/{id}/cancelar`                                                             | Dueño         |

Detalle completo, schemas y códigos de error en `/docs`.
