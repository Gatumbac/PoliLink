import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">PoliLink</p>
        <h1>Página no encontrada</h1>
        <p className="lead">La ruta solicitada todavía no existe.</p>
        <Link to="/">Volver al inicio</Link>
      </section>
    </main>
  )
}
