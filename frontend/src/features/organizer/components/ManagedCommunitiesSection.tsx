import { Plus, RefreshCw, UsersRound } from 'lucide-react'
import { useState } from 'react'

import { CommunityForm } from '@/features/communities/components/CommunityForm'
import { useManagedCommunities } from '@/features/organizer/hooks/use-organizer-queries'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Skeleton } from '@/shared/ui/skeleton'

export function ManagedCommunitiesSection() {
  const communitiesQuery = useManagedCommunities()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  if (communitiesQuery.isPending) {
    return (
      <section aria-label="Mis comunidades" className="space-y-4">
        <div className="flex items-center gap-3">
          <UsersRound
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div
          aria-label="Cargando comunidades"
          className="grid gap-4 md:grid-cols-2"
          role="status"
        >
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </section>
    )
  }

  if (communitiesQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No pudimos cargar tus comunidades</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>Intenta nuevamente para consultar tus comunidades.</span>
          <Button
            onClick={() => void communitiesQuery.refetch()}
            size="sm"
            variant="outline"
          >
            <RefreshCw aria-hidden="true" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const communities = communitiesQuery.data ?? []

  if (communities.length === 0) {
    return (
      <section aria-labelledby="communities-title" className="space-y-5">
        <div className="flex items-start gap-3">
          <UsersRound
            aria-hidden="true"
            className="mt-1 size-5 text-muted-foreground"
          />
          <div>
            <h2
              className="font-heading text-xl font-medium"
              id="communities-title"
            >
              Crea tu comunidad
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Registra la comunidad que coordinas para comenzar a publicar
              actividades.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Primero, cuéntanos sobre tu comunidad</CardTitle>
            <CardDescription>
              Solo necesitas un nombre. Puedes añadir una descripción para que
              los estudiantes conozcan mejor su propósito.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommunityForm />
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section aria-labelledby="communities-title" className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <UsersRound
            aria-hidden="true"
            className="mt-1 size-5 text-muted-foreground"
          />
          <div>
            <h2
              className="font-heading text-xl font-medium"
              id="communities-title"
            >
              Mis comunidades
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Comunidades que administras en PoliLink.
            </p>
          </div>
        </div>
        <Dialog onOpenChange={setIsCreateDialogOpen} open={isCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus aria-hidden="true" />
              Nueva comunidad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva comunidad</DialogTitle>
              <DialogDescription>
                Registra otra comunidad que coordinas.
              </DialogDescription>
            </DialogHeader>
            <CommunityForm
              onCancel={() => setIsCreateDialogOpen(false)}
              onCreated={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {communities.map((community) => (
          <li key={community.id}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>
                  {community.description || 'Sin descripción registrada.'}
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
