import { ArrowRight, UsersRound } from 'lucide-react'
import { Link } from 'react-router'

import { appRoutes } from '@/app/routes'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

export function CommunityOrganizerCallout() {
  return (
    <Card className="bg-muted/30">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <CardHeader className="min-w-0 flex-1 p-0">
          <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-background text-foreground">
            <UsersRound aria-hidden="true" className="size-4" />
          </div>
          <CardTitle aria-level={2} role="heading">
            ¿Formas parte de una comunidad?
          </CardTitle>
          <CardDescription>
            Organiza sus actividades y compártelas con la comunidad estudiantil
            de ESPOL.
          </CardDescription>
        </CardHeader>
        <CardContent className="shrink-0 p-0">
          <Button asChild variant="outline">
            <Link to={appRoutes.organize}>
              Conoce cómo organizar
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </div>
    </Card>
  )
}
