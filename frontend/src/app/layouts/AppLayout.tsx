import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink, Outlet } from 'react-router'

import { appRoutes } from '@/app/routes'
import { type AuthStatus, useAuth } from '@/features/auth/auth-context'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { hasRole } from '@/features/auth/model/auth-helpers'
import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

type NavigationItem = {
  label: string
  to: string
}

function AppNavLink({ children, to }: { children: ReactNode; to: string }) {
  return (
    <NavLink
      className={({ isActive }) =>
        `rounded-md px-1 py-2 transition-colors hover:text-foreground ${isActive ? 'font-medium text-foreground' : ''}`
      }
      to={to}
    >
      {children}
    </NavLink>
  )
}

function getNavigationItems(
  isAuthenticated: boolean,
  isOrganizer: boolean,
): NavigationItem[] {
  if (isOrganizer) {
    return [
      { label: 'Eventos', to: appRoutes.events },
      { label: 'Mis comunidades', to: appRoutes.myCommunities },
      { label: 'Mis eventos', to: appRoutes.myEvents },
      { label: 'Mis inscripciones', to: appRoutes.myRegistrations },
    ]
  }

  const items: NavigationItem[] = [{ label: 'Eventos', to: appRoutes.events }]

  if (isAuthenticated) {
    items.push(
      { label: 'Mis inscripciones', to: appRoutes.myRegistrations },
      { label: 'Organiza una comunidad', to: appRoutes.organize },
    )
  }

  return items
}

function NavigationItems({
  closeOnNavigate = false,
  isAuthenticated,
  isOrganizer,
}: {
  closeOnNavigate?: boolean
  isAuthenticated: boolean
  isOrganizer: boolean
}) {
  return getNavigationItems(isAuthenticated, isOrganizer).map((item) =>
    closeOnNavigate ? (
      <SheetClose asChild key={item.to}>
        <AppNavLink to={item.to}>{item.label}</AppNavLink>
      </SheetClose>
    ) : (
      <AppNavLink key={item.to} to={item.to}>
        {item.label}
      </AppNavLink>
    ),
  )
}

function MobileNavigation({
  isAuthenticated,
  isOrganizer,
  status,
}: {
  isAuthenticated: boolean
  isOrganizer: boolean
  status: AuthStatus
}) {
  const showAuthActions =
    !isAuthenticated && (status === 'anonymous' || status === 'error')

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button aria-label="Abrir menú" size="icon" variant="ghost">
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        aria-label="Menú de navegación"
        className="w-[min(20rem,85vw)]"
        side="right"
      >
        <SheetHeader>
          <SheetTitle>PoliLink</SheetTitle>
          <SheetDescription>Navegación principal</SheetDescription>
        </SheetHeader>
        <nav aria-label="Navegación móvil" className="flex flex-col px-4">
          <NavigationItems
            closeOnNavigate
            isAuthenticated={isAuthenticated}
            isOrganizer={isOrganizer}
          />
        </nav>
        {showAuthActions && (
          <SheetFooter>
            <SheetClose asChild>
              <Button asChild variant="outline">
                <Link to={appRoutes.login}>Iniciar sesión</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button asChild>
                <Link to={appRoutes.register}>Crear cuenta</Link>
              </Button>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

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
            <div className="hidden items-center gap-3 sm:flex">
              <NavigationItems
                isAuthenticated={isAuthenticated}
                isOrganizer={isOrganizer}
              />
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
            </div>
            <div className="flex items-center gap-1 sm:hidden">
              <MobileNavigation
                isAuthenticated={isAuthenticated}
                isOrganizer={isOrganizer}
                status={status}
              />
              {status === 'authenticated' && <UserMenu />}
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
