import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  UsersRound,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { appRoutes } from '@/app/routes'
import { applyApiFieldErrors } from '@/features/auth/model/auth-form-errors'
import { CommunityFormFields } from '@/features/communities/components/CommunityFormFields'
import {
  type Community,
  type CommunityCreatePayload,
  communityCreatePayloadSchema,
} from '@/features/communities/model/community.schemas'
import { getCommunityErrorMessage } from '@/features/communities/model/community-form-errors'
import { useCreateCommunity } from '@/features/organizer/hooks/use-organizer-queries'
import { ApiError } from '@/shared/errors/api-error'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

type OnboardingStep = 1 | 2 | 3

const steps = [
  { number: 1, label: 'Tu comunidad' },
  { number: 2, label: 'Información básica' },
  { number: 3, label: 'Confirmación' },
] as const

function CommunityOnboardingProgress({ step }: { step: OnboardingStep }) {
  return (
    <ol aria-label="Progreso del registro" className="grid grid-cols-3 gap-2">
      {steps.map((item) => {
        const isCurrent = item.number === step
        const isComplete = item.number < step

        return (
          <li
            aria-current={isCurrent ? 'step' : undefined}
            className="space-y-2"
            key={item.number}
          >
            <div
              className={`h-1 rounded-full ${isComplete || isCurrent ? 'bg-primary' : 'bg-muted'}`}
            />
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] ${isComplete || isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {isComplete ? <Check aria-hidden="true" /> : item.number}
              </span>
              <span
                className={
                  isCurrent
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                }
              >
                {item.label}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function CommunityCreatedState({ community }: { community: Community }) {
  return (
    <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted text-foreground">
              <CircleCheck aria-hidden="true" className="size-6" />
            </div>
            <Badge variant="secondary">Comunidad registrada</Badge>
            <CardTitle
              aria-level={2}
              className="text-2xl sm:text-3xl"
              role="heading"
            >
              {community.name} está lista
            </CardTitle>
            <CardDescription className="max-w-lg text-base">
              Ya puedes administrar esta comunidad en PoliLink y preparar sus
              próximas actividades.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to={appRoutes.myCommunities}>
                Ir a mis comunidades
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={appRoutes.events}>Explorar eventos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export function CommunityOnboardingPage() {
  const createCommunity = useCreateCommunity()
  const navigate = useNavigate()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [confirmationError, setConfirmationError] = useState<string | null>(
    null,
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [createdCommunity, setCreatedCommunity] = useState<Community | null>(
    null,
  )
  const form = useForm<CommunityCreatePayload>({
    defaultValues: {
      description: '',
      name: '',
    },
    resolver: zodResolver(communityCreatePayloadSchema),
  })

  if (createdCommunity) {
    return <CommunityCreatedState community={createdCommunity} />
  }

  const handleDetailsContinue = async () => {
    const isValid = await form.trigger(['name', 'description'])

    if (isValid) {
      setFormError(null)
      setStep(3)
    }
  }

  const handleCreate = async (payload: CommunityCreatePayload) => {
    if (!isConfirmed) {
      setConfirmationError(
        'Confirma que formas parte de esta comunidad para continuar.',
      )
      return
    }

    setConfirmationError(null)
    setFormError(null)

    try {
      const community = await createCommunity.mutateAsync({
        description: payload.description?.trim() || null,
        name: payload.name.trim(),
      })

      setCreatedCommunity(community)
    } catch (error: unknown) {
      applyApiFieldErrors(error, form.setError)
      setFormError(
        getCommunityErrorMessage(
          error,
          'No pudimos registrar la comunidad. Intenta nuevamente.',
        ),
      )

      if (error instanceof ApiError && error.status === 422) {
        setStep(2)
      }
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (step === 2) {
      event.preventDefault()
      void handleDetailsContinue()
      return
    }

    if (step === 3) {
      void form.handleSubmit(handleCreate)(event)
    }
  }

  const handleBack = () => {
    setFormError(null)
    setConfirmationError(null)
    setStep((currentStep) => (currentStep === 3 ? 2 : 1))
  }

  return (
    <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="max-w-2xl space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            ESPOL · Organiza una comunidad
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Registra tu comunidad
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Completa estos pasos para conectar las actividades de tu comunidad
            con estudiantes de ESPOL.
          </p>
        </header>

        <CommunityOnboardingProgress step={step} />

        <form noValidate onSubmit={handleSubmit}>
          <Card>
            {step === 1 && (
              <>
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted text-foreground">
                    <UsersRound aria-hidden="true" className="size-5" />
                  </div>
                  <CardTitle aria-level={2} role="heading">
                    Cuéntanos cómo quieres participar
                  </CardTitle>
                  <CardDescription>
                    PoliLink ayuda a las comunidades estudiantiles a compartir
                    sus actividades.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="h-auto w-full justify-between whitespace-normal p-4 text-left"
                    onClick={() => setStep(2)}
                    type="button"
                  >
                    <span>
                      <span className="block font-medium">
                        Registrar una comunidad nueva
                      </span>
                      <span className="mt-1 block text-sm font-normal text-primary-foreground/80">
                        Para quienes forman parte de una comunidad y coordinan
                        sus actividades.
                      </span>
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </Button>

                  <Button
                    className="h-auto w-full justify-between whitespace-normal p-4 text-left"
                    disabled
                    type="button"
                    variant="outline"
                  >
                    <span>
                      <span className="block font-medium">
                        Mi comunidad ya está en PoliLink
                      </span>
                      <span className="mt-1 block text-sm font-normal text-muted-foreground">
                        Esta opción estará disponible próximamente.
                      </span>
                    </span>
                    <Badge variant="secondary">Próximamente</Badge>
                  </Button>

                  <Button asChild className="w-full" variant="ghost">
                    <Link to={appRoutes.events}>
                      Solo quiero explorar eventos
                    </Link>
                  </Button>
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle aria-level={2} role="heading">
                    Información básica
                  </CardTitle>
                  <CardDescription>
                    Estos datos ayudarán a los estudiantes a reconocer tu
                    comunidad.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertTitle>No pudimos registrar la comunidad</AlertTitle>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  <CommunityFormFields
                    errors={form.formState.errors}
                    register={form.register}
                  />
                </CardContent>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle aria-level={2} role="heading">
                    Revisa antes de continuar
                  </CardTitle>
                  <CardDescription>
                    Confirma que la información representa a la comunidad que
                    coordinas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertTitle>No pudimos registrar la comunidad</AlertTitle>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">
                      Nombre de la comunidad
                    </p>
                    <p className="mt-1 font-medium">{form.getValues('name')}</p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Descripción
                    </p>
                    <p className="mt-1 text-sm">
                      {form.getValues('description') ||
                        'Sin descripción registrada.'}
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm leading-relaxed transition-colors hover:bg-muted/50">
                    <input
                      aria-describedby={
                        confirmationError
                          ? 'community-confirmation-error'
                          : undefined
                      }
                      checked={isConfirmed}
                      className="mt-1 size-4 accent-primary"
                      onChange={(event) => {
                        setIsConfirmed(event.target.checked)
                        setConfirmationError(null)
                      }}
                      type="checkbox"
                    />
                    <span>
                      Confirmo que formo parte de esta comunidad y puedo
                      representarla en PoliLink.
                    </span>
                  </label>
                  {confirmationError && (
                    <p
                      className="text-sm text-destructive"
                      id="community-confirmation-error"
                      role="alert"
                    >
                      {confirmationError}
                    </p>
                  )}
                </CardContent>
              </>
            )}

            <div className="flex flex-col-reverse gap-2 border-t bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                disabled={step === 1 || createCommunity.isPending}
                onClick={handleBack}
                type="button"
                variant="ghost"
              >
                <ArrowLeft aria-hidden="true" />
                Atrás
              </Button>
              {step === 1 && (
                <Button asChild variant="outline">
                  <Link to={appRoutes.organize}>Cancelar</Link>
                </Button>
              )}
              {step === 2 && (
                <Button type="submit">
                  Revisar información
                  <ArrowRight aria-hidden="true" />
                </Button>
              )}
              {step === 3 && (
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button
                    onClick={() => navigate(appRoutes.organize)}
                    type="button"
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button disabled={createCommunity.isPending} type="submit">
                    {createCommunity.isPending
                      ? 'Registrando comunidad…'
                      : 'Registrar comunidad'}
                    {!createCommunity.isPending && (
                      <CircleCheck aria-hidden="true" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </form>
      </div>
    </main>
  )
}
