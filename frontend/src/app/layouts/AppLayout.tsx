import { Link, Outlet } from 'react-router'

import { appRoutes } from '@/app/routes'
import { useAuth } from '@/features/auth/auth-context'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { hasRole } from '@/features/auth/model/auth-helpers'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

export function AppLayout() {
  const { status, user } = useAuth()
  const isAuthenticated = status === 'authenticated'
  const isOrganizer = isAuthenticated && hasRole(user, 'organizer')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-background/95">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="font-heading text-lg font-semibold tracking-[-0.02em] text-foreground"
            to={appRoutes.home}
          >
            PoliLink
          </Link>
          <nav
            aria-label="Navegación principal"
            className="flex items-center gap-2 text-sm text-muted-foreground sm:gap-4"
          >
            <Link
              className="mr-2 hidden transition-colors hover:text-foreground sm:inline"
              to={appRoutes.events}
            >
              Eventos
            </Link>
            {isAuthenticated && (
              <Link
                className="mr-2 transition-colors hover:text-foreground"
                to={isOrganizer ? appRoutes.myCommunities : appRoutes.organize}
              >
                {isOrganizer ? 'Mis comunidades' : 'Organiza una comunidad'}
              </Link>
            )}
            {(status === 'anonymous' || status === 'error') && (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link to={appRoutes.login}>Iniciar sesión</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to={appRoutes.register}>Crear cuenta</Link>
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
