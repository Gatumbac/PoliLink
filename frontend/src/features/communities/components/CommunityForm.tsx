import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { applyApiFieldErrors } from '@/features/auth/model/auth-form-errors'
import {
  type Community,
  type CommunityCreatePayload,
  communityCreatePayloadSchema,
} from '@/features/communities/model/community.schemas'
import { getCommunityErrorMessage } from '@/features/communities/model/community-form-errors'
import { useCreateCommunity } from '@/features/organizer/hooks/use-organizer-queries'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

type CommunityFormProps = {
  onCancel?: () => void
  onCreated?: (community: Community) => void
}

export function CommunityForm({ onCancel, onCreated }: CommunityFormProps) {
  const createCommunity = useCreateCommunity()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<CommunityCreatePayload>({
    defaultValues: {
      description: '',
      name: '',
    },
    resolver: zodResolver(communityCreatePayloadSchema),
  })

  const onSubmit = async (payload: CommunityCreatePayload) => {
    setFormError(null)

    try {
      const community = await createCommunity.mutateAsync({
        description: payload.description?.trim() || null,
        name: payload.name.trim(),
      })

      form.reset()
      onCreated?.(community)
    } catch (error: unknown) {
      applyApiFieldErrors(error, form.setError)
      setFormError(
        getCommunityErrorMessage(
          error,
          'No pudimos crear la comunidad. Intenta nuevamente.',
        ),
      )
    }
  }

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {formError && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos crear la comunidad</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.name)}>
          <FieldLabel htmlFor="community-name">
            Nombre de la comunidad
          </FieldLabel>
          <Input
            aria-describedby={
              form.formState.errors.name ? 'community-name-error' : undefined
            }
            aria-invalid={Boolean(form.formState.errors.name)}
            id="community-name"
            maxLength={255}
            placeholder="Ej. Club de Robótica"
            {...form.register('name')}
          />
          <FieldError
            id="community-name-error"
            errors={[form.formState.errors.name]}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.description)}>
          <FieldLabel htmlFor="community-description">
            Descripción{' '}
            <span className="font-normal text-muted-foreground">
              (opcional)
            </span>
          </FieldLabel>
          <Textarea
            aria-describedby={
              form.formState.errors.description
                ? 'community-description-error'
                : undefined
            }
            aria-invalid={Boolean(form.formState.errors.description)}
            id="community-description"
            placeholder="Cuéntales a los estudiantes sobre tu comunidad."
            {...form.register('description')}
          />
          <FieldError
            id="community-description-error"
            errors={[form.formState.errors.description]}
          />
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button onClick={onCancel} type="button" variant="outline">
            Cancelar
          </Button>
        )}
        <Button disabled={createCommunity.isPending} type="submit">
          {createCommunity.isPending ? 'Creando comunidad…' : 'Crear comunidad'}
        </Button>
      </div>
    </form>
  )
}
