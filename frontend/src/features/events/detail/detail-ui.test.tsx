import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import { EventDetailPage } from '@/features/events/detail/pages/EventDetailPage'
import { server } from '@/test/server'

const apiUrl = 'http://localhost:8000/api'

describe('public event detail', () => {
  it('renders the published event details and visible capacity', async () => {
    server.use(
      http.get(`${apiUrl}/events/7`, () =>
        HttpResponse.json({
          data: {
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
          },
        }),
      ),
    )

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/events/7']}>
          <Routes>
            <Route element={<EventDetailPage />} path="/events/:eventId" />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Taller Laravel' }),
    ).toBeInTheDocument()
    expect(screen.getByText('29 de 30 cupos disponibles')).toBeInTheDocument()
    expect(screen.getByText('Campus')).toBeInTheDocument()
  })
})
