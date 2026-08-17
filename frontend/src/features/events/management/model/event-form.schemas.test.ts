import { describe, expect, it } from 'vitest'

import {
  eventFormSchema,
  toCreateEventPayload,
} from '@/features/events/management/model/event-form.schemas'

const validValues = {
  capacity: '30',
  community_id: '4',
  description: 'Introducción práctica a Laravel.',
  event_category_id: '3',
  event_modality_id: '1',
  image: null,
  location_id: '1',
  starts_on: '2099-08-20',
  starts_time: '10:30',
  title: 'Taller Laravel',
}

describe('event form schema', () => {
  it('converts form strings into the backend event contract', () => {
    const values = eventFormSchema.parse(validValues)

    expect(toCreateEventPayload(values)).toEqual({
      capacity: 30,
      community_id: 4,
      description: 'Introducción práctica a Laravel.',
      event_category_id: 3,
      event_modality_id: 1,
      image: null,
      location_id: 1,
      starts_at: '2099-08-20T10:30:00-05:00',
      title: 'Taller Laravel',
    })
  })

  it('rejects a past event and invalid capacity', () => {
    const result = eventFormSchema.safeParse({
      ...validValues,
      capacity: '0',
      starts_on: '2020-01-01',
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'Ingresa al menos un cupo.',
            path: ['capacity'],
          }),
          expect.objectContaining({
            message: 'La fecha y hora deben ser futuras.',
            path: ['starts_on'],
          }),
        ]),
      )
    }
  })

  it('rejects unsupported or oversized images', () => {
    const invalidType = new File(['logo'], 'logo.gif', { type: 'image/gif' })
    const result = eventFormSchema.safeParse({
      ...validValues,
      image: invalidType,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'La imagen debe ser JPG, PNG o WebP.',
      )
    }
  })
})
