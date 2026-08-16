import type {
  FieldPath,
  FieldValues,
  UseFormSetError,
} from 'react-hook-form'

import { ApiError } from '@/shared/errors/api-error'

export function applyApiFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
): void {
  if (!(error instanceof ApiError)) return

  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const message = messages[0]

    if (message) {
      setError(field as FieldPath<TFieldValues>, {
        type: 'server',
        message,
      })
    }
  }
}

export function getAuthErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof ApiError)) return fallback

  if (error.status === 401) {
    return 'El correo o la contraseña no son correctos.'
  }

  if (error.status === 422) {
    return 'Revisa los datos ingresados.'
  }

  if (error.status === 429) {
    return 'Hay demasiados intentos. Espera un momento y vuelve a intentarlo.'
  }

  if (error.status === 0) {
    return 'No pudimos conectarnos con PoliLink. Intenta nuevamente.'
  }

  return error.message || fallback
}
