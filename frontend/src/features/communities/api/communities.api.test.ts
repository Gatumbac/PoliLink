import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import {
  communityApi,
  dashboardCommunitiesApi,
} from '@/features/communities/api/communities.api'
import { server } from '@/test/server'

const apiUrl = 'http://localhost:8000/api'

const community = {
  id: 4,
  name: 'Club de Robótica',
  description: 'Comunidad de robótica de ESPOL.',
}

describe('communities API', () => {
  it('creates a community with the validated JSON contract', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-token; path=/'

    server.use(
      http.post(`${apiUrl}/communities`, async ({ request }) => {
        expect(request.headers.get('Content-Type')).toContain(
          'application/json',
        )
        expect(await request.json()).toEqual({
          description: null,
          name: 'Club de Robótica',
        })

        return HttpResponse.json({ data: community }, { status: 201 })
      }),
    )

    await expect(
      communityApi.create({
        description: null,
        name: '  Club de Robótica  ',
      }),
    ).resolves.toEqual(community)
  })

  it('parses the authenticated managed communities collection', async () => {
    server.use(
      http.get(`${apiUrl}/me/communities`, () =>
        HttpResponse.json({ data: [community] }),
      ),
    )

    await expect(dashboardCommunitiesApi.list()).resolves.toEqual([community])
  })
})
