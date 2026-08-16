import { Link, Outlet } from 'react-router'

export function AppLayout() {
  return (
    <>
      <header className="app-header">
        <Link className="brand" to="/">
          PoliLink
        </Link>
        <nav aria-label="Navegación principal">
          <Link to="/">Eventos</Link>
        </nav>
      </header>
      <Outlet />
    </>
  )
}
