export type ApiFieldErrors = Record<string, string[]>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readMessage(payload: unknown, status: number): string {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload
  }

  if (isRecord(payload) && typeof payload.message === 'string') {
    return payload.message
  }

  return `PoliLink API request failed with status ${status}`
}

function readFieldErrors(payload: unknown): ApiFieldErrors {
  if (!isRecord(payload) || !isRecord(payload.errors)) return {}

  return Object.entries(payload.errors).reduce<ApiFieldErrors>(
    (fieldErrors, [field, value]) => {
      if (typeof value === 'string') {
        fieldErrors[field] = [value]
        return fieldErrors
      }

      if (Array.isArray(value)) {
        const messages = value.filter(
          (message): message is string => typeof message === 'string',
        )

        if (messages.length > 0) fieldErrors[field] = messages
      }

      return fieldErrors
    },
    {},
  )
}

export class ApiError extends Error {
  readonly status: number
  readonly payload: unknown
  readonly fieldErrors: ApiFieldErrors

  constructor(status: number, payload: unknown) {
    super(readMessage(payload, status))
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
    this.fieldErrors = readFieldErrors(payload)
  }
}
