import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { request } from '@/shared/api/client'
import { server } from '@/test/server'

describe('API client', () => {
  it('returns an unknown payload for a successful JSON response', async () => {
    server.use(
      http.get('http://localhost:8000/api/test', () =>
        HttpResponse.json({ status: 'ok' }),
      ),
    )

    await expect(request('/test')).resolves.toEqual({ status: 'ok' })
  })

  it('exposes status and payload for API errors', async () => {
    server.use(
      http.get('http://localhost:8000/api/missing', () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    )

    await expect(request('/missing')).rejects.toMatchObject({
      status: 404,
      payload: { message: 'Not found' },
    })
  })
})
