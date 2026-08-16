import { Link, Outlet } from 'react-router'

import { useAuth } from '@/features/auth/auth-context'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

export function AppLayout() {
  const { status } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-background/95">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="font-heading text-lg font-semibold tracking-[-0.02em] text-foreground"
            to="/"
          >
            PoliLink
          </Link>
          <nav
            aria-label="Navegación principal"
            className="flex items-center gap-2 text-sm text-muted-foreground sm:gap-4"
          >
            <Link
              className="mr-2 hidden transition-colors hover:text-foreground sm:inline"
              to="/"
            >
              Eventos
            </Link>
            {(status === 'anonymous' || status === 'error') && (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Crear cuenta</Link>
                </Button>
              </>
            )}
            {status === 'authenticated' && <UserMenu />}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
