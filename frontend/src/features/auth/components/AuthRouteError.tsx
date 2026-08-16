import { useState } from 'react'

import { useAuth } from '@/features/auth/auth-context'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'

export function AuthRouteError() {
  const { refresh } = useAuth()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)

    try {
      await refresh()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xl">
        <Alert variant="destructive">
          <AlertTitle>No pudimos verificar tu sesión</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>Intenta cargar nuevamente tu sesión para continuar.</span>
            <Button
              disabled={isRetrying}
              onClick={() => void handleRetry()}
              size="sm"
              variant="outline"
            >
              {isRetrying ? 'Reintentando…' : 'Reintentar'}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </main>
  )
}
