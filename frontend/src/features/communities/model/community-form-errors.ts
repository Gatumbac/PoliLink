import { ApiError } from '@/shared/errors/api-error'

export function getCommunityErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof ApiError)) return fallback

  if (error.status === 401) {
    return 'Tu sesión expiró. Inicia sesión nuevamente para continuar.'
  }

  if (error.status === 422) {
    return 'Revisa los datos ingresados.'
  }

  if (error.status === 0) {
    return 'No pudimos conectarnos con PoliLink. Intenta nuevamente.'
  }

  return error.message || fallback
}
