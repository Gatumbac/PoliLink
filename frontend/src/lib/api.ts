const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
const backendUrl = apiUrl.replace(/\/api\/?$/, '')

type AuthUser = {
  id: number
  first_name: string
  last_name: string
  email: string
  roles: Array<{ code: string; name: string }>
}

type AuthPayload = {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
}

function csrfToken(): string | undefined {
  const cookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('XSRF-TOKEN='))

  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : undefined
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (options.method && !['GET', 'HEAD'].includes(options.method)) {
    const token = csrfToken()
    if (token) headers.set('X-XSRF-TOKEN', token)
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  })

  if (!response.ok) throw await response.json()

  return response.status === 204 ? (undefined as T) : response.json()
}

export const authApi = {
  csrf: () => fetch(`${backendUrl}/sanctum/csrf-cookie`, { credentials: 'include' }),
  register: async (payload: AuthPayload) => {
    await authApi.csrf()
    return request<{ data: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  login: async (email: string, password: string) => {
    await authApi.csrf()
    return request<{ data: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  logout: () => request<void>('/auth/logout', { method: 'DELETE' }),
  me: () => request<{ data: AuthUser }>('/auth/me'),
}
