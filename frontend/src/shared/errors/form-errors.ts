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
