from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store - Trabajo Práctico Integrador",
    description="Sistema de pedidos de comida - Programación 4",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(usuarios_router)
app.include_router(categorias_router)
app.include_router(productos_router)
app.include_router(pedidos_router)


@app.get("/", tags=["sistema"])
def root() -> dict[str, str]:
    return {"message": "Food Store API"}
