import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'

import { useQuery } from '@tanstack/react-query'

import { authApi } from '@/features/auth/api/auth.api'
import type { AuthUser } from '@/features/auth/model/auth.schemas'
import { ApiError } from '@/shared/errors/api-error'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error'

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  error: Error | null
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionQuery = useQuery<AuthUser | null, Error>({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<AuthUser | null> => {
      try {
        return await authApi.me()
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    retry: false,
  })

  let status: AuthStatus

  if (sessionQuery.isPending) {
    status = 'loading'
  } else if (sessionQuery.isError) {
    status = 'error'
  } else if (sessionQuery.data) {
    status = 'authenticated'
  } else {
    status = 'anonymous'
  }

  const value: AuthContextValue = {
    user: sessionQuery.data ?? null,
    status,
    error: sessionQuery.error,
    refresh: async () => {
      await sessionQuery.refetch()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth must be used inside AuthProvider')

  return context
}
