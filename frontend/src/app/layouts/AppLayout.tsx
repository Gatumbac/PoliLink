import { Link, Outlet } from 'react-router'

import { ThemeToggle } from '@/shared/ui/theme-toggle'

export function AppLayout() {
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
            className="flex items-center gap-6 text-sm text-muted-foreground"
          >
            <Link className="transition-colors hover:text-foreground" to="/">
              Eventos
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
