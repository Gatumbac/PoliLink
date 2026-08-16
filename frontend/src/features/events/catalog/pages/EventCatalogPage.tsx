import { ArrowRight, CalendarDays, Search } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

export function EventCatalogPage() {
  return (
    <main className="min-h-[calc(100vh-73px)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="max-w-2xl space-y-6">
          <Badge variant="secondary">ESPOL · Comunidades estudiantiles</Badge>
          <h1 className="font-heading text-5xl leading-[1.02] font-semibold tracking-[-0.06em] sm:text-7xl">
            PoliLink
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Descubre eventos, talleres y actividades organizadas por las
            comunidades estudiantiles de ESPOL.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button>
              Explorar eventos
              <ArrowRight />
            </Button>
            <Button variant="outline">Publicar un evento</Button>
          </div>
          <Badge role="status" variant="outline">
            Base de la aplicación lista
          </Badge>
        </section>

        <Card className="bg-card/80">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted text-foreground">
              <CalendarDays aria-hidden="true" className="size-5" />
            </div>
            <CardTitle>Encuentra algo para ti</CardTitle>
            <CardDescription>
              La próxima fase conectará este espacio con el catálogo real de
              eventos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="secondary">
              <Search />
              Buscar por categoría, fecha o modalidad
            </Button>
            <p className="text-sm text-muted-foreground">
              Registro y cancelación liberarán los cupos automáticamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
