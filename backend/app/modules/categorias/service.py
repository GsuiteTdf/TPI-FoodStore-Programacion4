from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow_factory=CategoriaUnitOfWork) -> None:
        self.uow_factory = uow_factory

    @staticmethod
    def _read(categoria: Categoria) -> CategoriaRead:
        return CategoriaRead.model_validate(categoria)

    def listar(self) -> list[CategoriaRead]:
        with self.uow_factory() as uow:
            return [self._read(c) for c in uow.categorias.list_active()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow_factory() as uow:
            categoria = uow.categorias.get_active(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada
            return self._read(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        nombre = data.nombre.strip()
        with self.uow_factory() as uow:
            if uow.categorias.get_by_nombre(nombre) is not None:
                raise NombreDuplicado
            categoria = Categoria(nombre=nombre, descripcion=data.descripcion.strip(), activo=True)
            uow.categorias.add(categoria)
            uow.session.flush()
            return self._read(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow_factory() as uow:
            categoria = uow.categorias.get_active(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada
            cambios = data.model_dump(exclude_unset=True)
            if "nombre" in cambios and cambios["nombre"] is not None:
                nombre = cambios["nombre"].strip()
                existente = uow.categorias.get_by_nombre(nombre)
                if existente is not None and existente.id != categoria_id:
                    raise NombreDuplicado
                cambios["nombre"] = nombre
            if "descripcion" in cambios and cambios["descripcion"] is not None:
                cambios["descripcion"] = cambios["descripcion"].strip()
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            uow.session.flush()
            return self._read(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow_factory() as uow:
            categoria = uow.categorias.get_active(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada
            categoria.activo = False
            uow.categorias.add(categoria)
