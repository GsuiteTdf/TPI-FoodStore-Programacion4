import axios from 'axios'

interface ApiErrorBody {
  detail?: string
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.detail ?? error.message ?? 'Error de comunicación con la API'
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}
