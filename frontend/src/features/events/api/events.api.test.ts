import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { publicEventsApi } from '@/features/events/api/events.api'
import { server } from '@/test/server'

const apiUrl = 'http://localhost:8000/api'

const event = {
  id: 7,
  title: 'Taller Laravel',
  description: 'Introducción a Laravel.',
  starts_at: '2026-08-20T15:00:00.000000Z',
  capacity: 30,
  available_capacity: 29,
  category: { id: 3, code: 'hackathon', name: 'Hackathon' },
  modality: { id: 1, code: 'in_person', name: 'Presencial' },
  location: { id: 1, name: 'Campus', description: null },
  community: { id: 4, name: 'TAWS', description: null },
  status: { code: 'published', name: 'Publicado' },
  created_at: '2026-08-01T15:00:00.000000Z',
  updated_at: '2026-08-01T15:00:00.000000Z',
}

describe('public events API', () => {
  it('maps catalog filters to the Laravel query contract', async () => {
    server.use(
      http.get(`${apiUrl}/events`, ({ request }) => {
        const query = new URL(request.url).searchParams

        expect(query.get('search')).toBe('laravel')
        expect(query.get('date')).toBe('2026-08-20')
        expect(query.get('category')).toBe('hackathon')
        expect(query.get('modality')).toBe('in_person')
        expect(query.get('community_id')).toBe('4')
        expect(query.get('page')).toBe('2')
        expect(query.get('per_page')).toBe('12')

        return HttpResponse.json({
          data: [event],
          meta: {
            current_page: 2,
            last_page: 3,
            per_page: 12,
            total: 25,
          },
        })
      }),
    )

    await expect(
      publicEventsApi.list({
        search: 'laravel',
        date: '2026-08-20',
        category: 'hackathon',
        modality: 'in_person',
        communityId: 4,
        page: 2,
        perPage: 12,
      }),
    ).resolves.toMatchObject({
      data: [event],
      meta: { current_page: 2, last_page: 3 },
    })
  })

  it('parses event details and public reference data', async () => {
    server.use(
      http.get(`${apiUrl}/events/7`, () =>
        HttpResponse.json({ data: event }),
      ),
      http.get(`${apiUrl}/event-categories`, () =>
        HttpResponse.json({ data: [event.category] }),
      ),
      http.get(`${apiUrl}/event-modalities`, () =>
        HttpResponse.json({ data: [event.modality] }),
      ),
      http.get(`${apiUrl}/communities`, () =>
        HttpResponse.json({ data: [event.community] }),
      ),
    )

    await expect(publicEventsApi.detail(7)).resolves.toEqual(event)
    await expect(publicEventsApi.categories()).resolves.toEqual([
      event.category,
    ])
    await expect(publicEventsApi.modalities()).resolves.toEqual([
      event.modality,
    ])
    await expect(publicEventsApi.communities()).resolves.toEqual([
      event.community,
    ])
  })
})
