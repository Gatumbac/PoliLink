import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'
import { Controller } from 'react-hook-form'

import type {
  EventFormReferenceData,
  EventFormValues,
} from '@/features/events/management/model/event-form.schemas'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { ImageUploader } from '@/shared/ui/image-uploader'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

type EventFormFieldsProps = EventFormReferenceData & {
  control: Control<EventFormValues>
  errors: FieldErrors<EventFormValues>
  register: UseFormRegister<EventFormValues>
  selectedImage: EventFormValues['image']
  setValue: UseFormSetValue<EventFormValues>
  step: 1 | 2
}

function ReferenceSelect({
  control,
  error,
  id,
  label,
  name,
  options,
  placeholder,
}: {
  control: Control<EventFormValues>
  error: FieldErrors<EventFormValues>[keyof EventFormValues]
  id: string
  label: string
  name:
    | 'community_id'
    | 'event_category_id'
    | 'event_modality_id'
    | 'location_id'
  options: Array<{ id: number; name: string }>
  placeholder: string
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            disabled={options.length === 0}
            onValueChange={field.onChange}
            value={field.value}
          >
            <SelectTrigger
              aria-describedby={error ? `${id}-error` : undefined}
              aria-invalid={Boolean(error)}
              id={id}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FieldError id={`${id}-error`} errors={[error]} />
    </Field>
  )
}

export function EventFormFields({
  categories,
  communities,
  control,
  errors,
  locations,
  modalities,
  register,
  selectedImage,
  setValue,
  step,
}: EventFormFieldsProps) {
  if (step === 1) {
    return (
      <FieldGroup>
        <Field data-invalid={Boolean(errors.title)}>
          <FieldLabel htmlFor="event-title">Título del evento</FieldLabel>
          <Input
            aria-describedby={errors.title ? 'event-title-error' : undefined}
            aria-invalid={Boolean(errors.title)}
            id="event-title"
            maxLength={255}
            placeholder="Ej. Taller de introducción a Laravel"
            {...register('title')}
          />
          <FieldError id="event-title-error" errors={[errors.title]} />
        </Field>

        <Field data-invalid={Boolean(errors.description)}>
          <FieldLabel htmlFor="event-description">
            Descripción del evento
          </FieldLabel>
          <Textarea
            aria-describedby={
              errors.description ? 'event-description-error' : undefined
            }
            aria-invalid={Boolean(errors.description)}
            id="event-description"
            placeholder="Cuéntales a los estudiantes qué aprenderán o encontrarán."
            rows={5}
            {...register('description')}
          />
          <FieldError
            id="event-description-error"
            errors={[errors.description]}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <ReferenceSelect
            control={control}
            error={errors.event_category_id}
            id="event-category"
            label="Categoría"
            name="event_category_id"
            options={categories}
            placeholder="Selecciona una categoría"
          />
          <ReferenceSelect
            control={control}
            error={errors.community_id}
            id="event-community"
            label="Comunidad organizadora"
            name="community_id"
            options={communities}
            placeholder="Selecciona una comunidad"
          />
        </div>
      </FieldGroup>
    )
  }

  return (
    <FieldGroup>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.starts_on)}>
          <FieldLabel htmlFor="event-starts-on">Fecha</FieldLabel>
          <Input
            aria-describedby={
              errors.starts_on ? 'event-starts-on-error' : undefined
            }
            aria-invalid={Boolean(errors.starts_on)}
            id="event-starts-on"
            type="date"
            {...register('starts_on')}
          />
          <FieldError id="event-starts-on-error" errors={[errors.starts_on]} />
        </Field>
        <Field data-invalid={Boolean(errors.starts_time)}>
          <FieldLabel htmlFor="event-starts-time">Hora (ESPOL)</FieldLabel>
          <Input
            aria-describedby={
              errors.starts_time ? 'event-starts-time-error' : undefined
            }
            aria-invalid={Boolean(errors.starts_time)}
            id="event-starts-time"
            type="time"
            {...register('starts_time')}
          />
          <FieldError
            id="event-starts-time-error"
            errors={[errors.starts_time]}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ReferenceSelect
          control={control}
          error={errors.event_modality_id}
          id="event-modality"
          label="Modalidad"
          name="event_modality_id"
          options={modalities}
          placeholder="Selecciona una modalidad"
        />
        <ReferenceSelect
          control={control}
          error={errors.location_id}
          id="event-location"
          label="Ubicación"
          name="location_id"
          options={locations}
          placeholder="Selecciona una ubicación"
        />
      </div>

      <Field data-invalid={Boolean(errors.capacity)}>
        <FieldLabel htmlFor="event-capacity">Cupos disponibles</FieldLabel>
        <Input
          aria-describedby={
            errors.capacity ? 'event-capacity-error' : undefined
          }
          aria-invalid={Boolean(errors.capacity)}
          id="event-capacity"
          inputMode="numeric"
          min={1}
          placeholder="Ej. 30"
          type="number"
          {...register('capacity')}
        />
        <FieldError id="event-capacity-error" errors={[errors.capacity]} />
      </Field>

      <Field data-invalid={Boolean(errors.image)}>
        <FieldLabel htmlFor="event-image">
          Imagen del evento{' '}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </FieldLabel>
        <ImageUploader
          ariaLabel="Imagen del evento"
          error={Boolean(errors.image)}
          errorId="event-image-error"
          inputId="event-image"
          onClear={() =>
            setValue('image', null, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          onSelect={(file) =>
            setValue('image', file, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          selectedImage={selectedImage}
        />
        <FieldError id="event-image-error" errors={[errors.image]} />
      </Field>
    </FieldGroup>
  )
}
