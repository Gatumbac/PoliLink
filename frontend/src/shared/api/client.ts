import { apiConfig } from '@/shared/config/env'
import { ApiError } from '@/shared/errors/api-error'

export type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

function readCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined

  const cookie = document.cookie
    .split('; ')
    .find((value) => value.startsWith('XSRF-TOKEN='))

  return cookie
    ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length))
    : undefined
}

export async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()

  if (text.length === 0) return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function request(
  path: string,
  options: RequestOptions = {},
): Promise<unknown> {
  const headers = new Headers(options.headers)
  const method = (options.method ?? 'GET').toUpperCase()

  headers.set('Accept', 'application/json')

  if (!['GET', 'HEAD'].includes(method)) {
    const token = readCsrfToken()

    if (token) headers.set('X-XSRF-TOKEN', token)
    headers.set('Content-Type', 'application/json')
  }

  const requestInit: RequestInit = {
    ...options,
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
    credentials: 'include',
    headers,
  }

  const response = await fetch(`${apiConfig.apiUrl}${path}`, requestInit)
  const payload = await readResponseBody(response)

  if (!response.ok) throw new ApiError(response.status, payload)

  return payload
}

export async function requestCsrfCookie(): Promise<void> {
  const response = await fetch(`${apiConfig.backendUrl}/sanctum/csrf-cookie`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new ApiError(response.status, await readResponseBody(response))
  }
}
