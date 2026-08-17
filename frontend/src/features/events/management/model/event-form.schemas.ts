import { z } from 'zod'

import type {
  EventCategory,
  EventCommunity,
  EventLocation,
  EventModality,
  EventWriteFields,
} from '@/features/events/model/event.schemas'

export const eventImageFileSchema = z
  .file()
  .max(5 * 1024 * 1024, 'La imagen no puede superar los 5 MB.')
  .mime(
    ['image/jpeg', 'image/png', 'image/webp'],
    'La imagen debe ser JPG, PNG o WebP.',
  )

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const timePattern = /^\d{2}:\d{2}$/

function toEspolDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00-05:00`)
}

export const eventFormSchema = z
  .object({
    capacity: z
      .string()
      .regex(/^\d+$/, 'Ingresa un número entero de cupos.')
      .refine((value) => Number(value) > 0, 'Ingresa al menos un cupo.'),
    community_id: z.string().min(1, 'Selecciona una comunidad.'),
    description: z.string().trim().min(1, 'Ingresa la descripción del evento.'),
    event_category_id: z.string().min(1, 'Selecciona una categoría.'),
    event_modality_id: z.string().min(1, 'Selecciona una modalidad.'),
    image: eventImageFileSchema.nullable().optional(),
    location_id: z.string().min(1, 'Selecciona una ubicación.'),
    starts_on: z.string().regex(datePattern, 'Selecciona una fecha válida.'),
    starts_time: z.string().regex(timePattern, 'Selecciona una hora válida.'),
    title: z
      .string()
      .trim()
      .min(1, 'Ingresa el título del evento.')
      .max(255, 'El título no puede superar los 255 caracteres.'),
  })
  .superRefine((values, context) => {
    if (
      !datePattern.test(values.starts_on) ||
      !timePattern.test(values.starts_time)
    ) {
      return
    }

    const startsAt = toEspolDate(values.starts_on, values.starts_time)

    if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
      context.addIssue({
        code: 'custom',
        message: 'La fecha y hora deben ser futuras.',
        path: ['starts_on'],
      })
    }
  })

export type EventFormValues = z.infer<typeof eventFormSchema>

export type EventFormReferenceData = {
  categories: EventCategory[]
  communities: EventCommunity[]
  locations: EventLocation[]
  modalities: EventModality[]
}

export type CreateEventFormPayload = EventWriteFields & {
  image: File | null
}

export function toCreateEventPayload(
  values: EventFormValues,
): CreateEventFormPayload {
  return {
    capacity: Number(values.capacity),
    community_id: Number(values.community_id),
    description: values.description.trim(),
    event_category_id: Number(values.event_category_id),
    event_modality_id: Number(values.event_modality_id),
    image: values.image ?? null,
    location_id: Number(values.location_id),
    starts_at: `${values.starts_on}T${values.starts_time}:00-05:00`,
    title: values.title.trim(),
  }
}
