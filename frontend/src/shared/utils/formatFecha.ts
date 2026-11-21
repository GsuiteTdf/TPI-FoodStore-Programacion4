const formato = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Fecha ISO de la API (en UTC) mostrada en la hora local del navegador, formato 24 h. */
export function formatFecha(iso: string): string {
  return formato.format(new Date(iso))
}
