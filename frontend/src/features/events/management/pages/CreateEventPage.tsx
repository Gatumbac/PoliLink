import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  CircleCheck,
  LoaderCircle,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { appRoutes } from '@/app/routes'
import { useEventWriteReferenceData } from '@/features/events/catalog/hooks/use-event-queries'
import { EventFormFields } from '@/features/events/management/components/EventFormFields'
import {
  type EventFormValues,
  eventFormSchema,
  toCreateEventPayload,
} from '@/features/events/management/model/event-form.schemas'
import {
  useCreateOrganizerEvent,
  useManagedCommunities,
} from '@/features/organizer/hooks/use-organizer-queries'
import { ApiError } from '@/shared/errors/api-error'
import { applyApiFieldErrors } from '@/shared/errors/form-errors'
import { useUnsavedChangesGuard } from '@/shared/hooks/use-unsaved-changes-guard'
import { ApiErrorFeedback } from '@/shared/ui/api-error-feedback'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { FieldDescription } from '@/shared/ui/field'
import { Skeleton } from '@/shared/ui/skeleton'

type CreateEventStep = 1 | 2

const steps = [
  { label: 'Información básica', number: 1 },
  { label: 'Detalles y publicación', number: 2 },
] as const

const basicFields = [
  'title',
  'description',
  'event_category_id',
  'community_id',
] as const

function CreateEventProgress({ step }: { step: CreateEventStep }) {
  return (
    <ol
      aria-label="Progreso de la publicación"
      className="grid grid-cols-2 gap-2"
    >
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
                {isComplete ? <CircleCheck aria-hidden="true" /> : item.number}
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

function CreateEventSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CreateEventPage() {
  const navigate = useNavigate()
  const createEvent = useCreateOrganizerEvent()
  const managedCommunities = useManagedCommunities()
  const referenceData = useEventWriteReferenceData()
  const [step, setStep] = useState<CreateEventStep>(1)
  const [formError, setFormError] = useState<unknown>(null)
  const form = useForm<EventFormValues>({
    defaultValues: {
      capacity: '',
      community_id: '',
      description: '',
      event_category_id: '',
      event_modality_id: '',
      image: null,
      location_id: '',
      starts_on: '',
      starts_time: '',
      title: '',
    },
    mode: 'onTouched',
    resolver: zodResolver(eventFormSchema),
  })
  const formValues = form.watch()
  const selectedImage = formValues.image
  const hasUnsavedDetails = form.formState.isDirty || Boolean(selectedImage)
  const exitGuard = useUnsavedChangesGuard(
    hasUnsavedDetails && !createEvent.isPending,
  )

  const handleBasicContinue = async () => {
    if (createEvent.isPending) return

    const isValid = await form.trigger([...basicFields])

    if (isValid) {
      setFormError(null)
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCreate = async (values: EventFormValues) => {
    if (createEvent.isPending) return

    setFormError(null)

    try {
      const event = await createEvent.mutateAsync(toCreateEventPayload(values))
      exitGuard.allowNavigation()
      form.reset()
      navigate(appRoutes.myEvents, {
        replace: true,
        state: { createdEventTitle: event.title },
        viewTransition: 'startViewTransition' in document,
      })
    } catch (error: unknown) {
      applyApiFieldErrors(error, form.setError, { starts_at: 'starts_on' })
      setFormError(error)

      if (error instanceof ApiError && error.kind === 'validation') {
        const hasBasicError = basicFields.some(
          (field) => error.fieldErrors[field]?.length,
        )

        if (hasBasicError) setStep(1)
      }
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (createEvent.isPending) {
      event.preventDefault()
      return
    }

    if (step === 1) {
      event.preventDefault()
      void handleBasicContinue()
      return
    }

    void form.handleSubmit(handleCreate, (errors) => {
      if (basicFields.some((field) => errors[field])) setStep(1)
    })(event)
  }

  const handleBack = () => {
    if (createEvent.isPending) return

    setFormError(null)
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isLoading = managedCommunities.isPending || referenceData.isPending
  const loadError = managedCommunities.error ?? referenceData.error
  const hasLoadError = managedCommunities.isError || referenceData.isError
  const communities = managedCommunities.data ?? []

  return (
    <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="max-w-2xl space-y-3">
          <Link
            className="inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            to={appRoutes.myEvents}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver a mis eventos
          </Link>
          <p className="text-sm font-medium text-muted-foreground">
            ESPOL · Organización
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Publica un evento
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Comparte una actividad de tu comunidad con los estudiantes de ESPOL.
          </p>
        </header>

        <CreateEventProgress step={step} />

        {hasLoadError && (
          <ApiErrorFeedback
            error={loadError}
            isRetrying={
              managedCommunities.isFetching || referenceData.isFetching
            }
            messageOverrides={{
              forbidden:
                'No pudimos consultar la información necesaria para publicar el evento.',
            }}
            onRetry={() => {
              void Promise.all([
                managedCommunities.refetch(),
                referenceData.refetch(),
              ])
            }}
            title="No pudimos cargar los datos del formulario"
          />
        )}

        {isLoading && <CreateEventSkeleton />}

        {!isLoading && !hasLoadError && communities.length === 0 && (
          <section className="rounded-xl border border-dashed p-8 text-center sm:p-12">
            <CalendarPlus className="mx-auto size-8 text-muted-foreground" />
            <h2 className="mt-4 font-heading text-xl font-medium">
              Primero necesitas una comunidad
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Los eventos se publican en nombre de una comunidad que administras
              en PoliLink.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to={appRoutes.createCommunity}>
                  Registrar una comunidad
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={appRoutes.myCommunities}>Ver mis comunidades</Link>
              </Button>
            </div>
          </section>
        )}

        {!isLoading && !hasLoadError && communities.length > 0 && (
          <>
            {formError !== null && (
              <ApiErrorFeedback
                error={formError}
                messageOverrides={{
                  forbidden:
                    'Solo puedes publicar eventos para comunidades que administras.',
                  validation:
                    'Revisa los datos del evento antes de publicarlo.',
                }}
                title="No pudimos publicar el evento"
              />
            )}

            <form
              aria-busy={createEvent.isPending}
              noValidate
              onSubmit={handleSubmit}
            >
              <fieldset className="min-w-0" disabled={createEvent.isPending}>
                <Card>
                  {step === 1 && (
                    <>
                      <CardHeader>
                        <CardTitle aria-level={2} role="heading">
                          Información básica
                        </CardTitle>
                        <CardDescription>
                          Presenta el evento y elige la comunidad que lo
                          organiza.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <EventFormFields
                          categories={referenceData.categories}
                          communities={communities}
                          control={form.control}
                          disabled={createEvent.isPending}
                          errors={form.formState.errors}
                          locations={referenceData.locations}
                          modalities={referenceData.modalities}
                          register={form.register}
                          selectedImage={selectedImage}
                          selectedDate={formValues.starts_on}
                          setValue={form.setValue}
                          step={step}
                        />
                      </CardContent>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <CardHeader>
                        <CardTitle aria-level={2} role="heading">
                          Detalles y publicación
                        </CardTitle>
                        <CardDescription>
                          Completa cuándo y dónde será la actividad. Se
                          publicará de inmediato al confirmar.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <section className="rounded-lg border bg-muted/30 p-4">
                          <h2 className="text-sm font-medium">
                            Resumen básico
                          </h2>
                          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                              <dt className="text-muted-foreground">Título</dt>
                              <dd className="mt-1 font-medium">
                                {formValues.title}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">
                                Comunidad
                              </dt>
                              <dd className="mt-1 font-medium">
                                {communities.find(
                                  (community) =>
                                    String(community.id) ===
                                    formValues.community_id,
                                )?.name ?? 'Sin seleccionar'}
                              </dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="text-muted-foreground">
                                Descripción
                              </dt>
                              <dd className="mt-1 whitespace-pre-wrap">
                                {formValues.description}
                              </dd>
                            </div>
                          </dl>
                          <Button
                            className="mt-4"
                            onClick={handleBack}
                            type="button"
                            variant="ghost"
                          >
                            <ArrowLeft aria-hidden="true" />
                            Editar información básica
                          </Button>
                        </section>

                        <EventFormFields
                          categories={referenceData.categories}
                          communities={communities}
                          control={form.control}
                          disabled={createEvent.isPending}
                          errors={form.formState.errors}
                          locations={referenceData.locations}
                          modalities={referenceData.modalities}
                          register={form.register}
                          selectedImage={selectedImage}
                          selectedDate={formValues.starts_on}
                          setValue={form.setValue}
                          step={step}
                        />
                        <FieldDescription>
                          La fecha se enviará con la zona horaria de ESPOL
                          (UTC-5).
                        </FieldDescription>
                      </CardContent>
                    </>
                  )}

                  <div
                    className={`flex flex-col-reverse gap-2 border-t bg-muted/20 p-4 sm:flex-row sm:items-center ${step === 1 ? 'sm:justify-end' : 'sm:justify-between'}`}
                  >
                    <Button asChild type="button" variant="ghost">
                      <Link
                        aria-disabled={createEvent.isPending}
                        onClick={(event) => {
                          if (createEvent.isPending) event.preventDefault()
                        }}
                        tabIndex={createEvent.isPending ? -1 : undefined}
                        to={appRoutes.myEvents}
                      >
                        Cancelar
                      </Link>
                    </Button>
                    {step === 1 && (
                      <Button disabled={createEvent.isPending} type="submit">
                        Continuar con los detalles
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    )}
                    {step === 2 && (
                      <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        <Button
                          disabled={createEvent.isPending}
                          onClick={handleBack}
                          type="button"
                          variant="outline"
                        >
                          <ArrowLeft aria-hidden="true" />
                          Atrás
                        </Button>
                        <Button disabled={createEvent.isPending} type="submit">
                          {createEvent.isPending && (
                            <LoaderCircle
                              aria-hidden="true"
                              className="animate-spin"
                            />
                          )}
                          {createEvent.isPending
                            ? 'Publicando evento…'
                            : 'Publicar evento'}
                          {!createEvent.isPending && (
                            <CircleCheck aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </fieldset>
            </form>
          </>
        )}

        <Dialog
          onOpenChange={exitGuard.handleDialogChange}
          open={exitGuard.isDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Salir sin publicar?</DialogTitle>
              <DialogDescription>
                Perderás la información ingresada y tendrás que comenzar
                nuevamente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={exitGuard.stay} variant="outline">
                Continuar editando
              </Button>
              <Button onClick={exitGuard.leave} variant="destructive">
                Salir sin guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
