import {
  authEnvelopeSchema,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from '@/features/auth/model/auth.schemas'
import { request, requestCsrfCookie } from '@/shared/api/client'

function parseAuthUser(payload: unknown): AuthUser {
  return authEnvelopeSchema.parse(payload).data
}

export const authApi = {
  csrf: requestCsrfCookie,

  register: async (payload: RegisterPayload): Promise<AuthUser> => {
    await requestCsrfCookie()

    return parseAuthUser(
      await request('/auth/register', { method: 'POST', body: payload }),
    )
  },

  login: async (payload: LoginPayload): Promise<AuthUser> => {
    await requestCsrfCookie()

    return parseAuthUser(
      await request('/auth/login', { method: 'POST', body: payload }),
    )
  },

  logout: async (): Promise<void> => {
    await request('/auth/logout', { method: 'DELETE' })
  },

  me: async (): Promise<AuthUser> => parseAuthUser(await request('/auth/me')),
}
