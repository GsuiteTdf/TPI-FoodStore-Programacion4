from datetime import datetime, timezone
from typing import Annotated

from pydantic import AfterValidator


def utc_now() -> datetime:
    """Hora actual en UTC, sin tzinfo.

    Las columnas son TIMESTAMP WITHOUT TIME ZONE: si se les pasa un datetime con zona,
    PostgreSQL lo convierte a la zona horaria del servidor y la hora guardada depende de
    esa configuración. Guardando siempre UTC "naive" el valor es el mismo en cualquier
    servidor (PostgreSQL o SQLite).
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)


def inicio_del_dia_local_en_utc() -> datetime:
    """Medianoche de hoy en la hora local del servidor, expresada en UTC sin tzinfo."""
    ahora_local = datetime.now().astimezone()
    medianoche = ahora_local.replace(hour=0, minute=0, second=0, microsecond=0)
    return medianoche.astimezone(timezone.utc).replace(tzinfo=None)


def _marcar_utc(valor: datetime) -> datetime:
    return valor.replace(tzinfo=timezone.utc) if valor.tzinfo is None else valor


# Para los schemas de salida: el JSON lleva "+00:00" y el navegador lo pasa a hora local.
UtcDatetime = Annotated[datetime, AfterValidator(_marcar_utc)]
