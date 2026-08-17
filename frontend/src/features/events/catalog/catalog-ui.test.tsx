import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { appRoutes } from '@/app/routes'
import { EventCatalogPage } from '@/features/events/catalog/pages/EventCatalogPage'
import { server } from '@/test/server'

const apiUrl = 'http://localhost:8000/api'

const event = {
  id: 7,
  title: 'Taller Laravel',
  description: 'Introducción a Laravel.',
  image_url: null,
  starts_at: '2026-08-20T15:00:00.000000Z',
  capacity: 30,
  available_capacity: 29,
  category: { id: 3, code: 'hackathon', name: 'Hackathon' },
  modality: { id: 1, code: 'in_person', name: 'Presencial' },
  location: { id: 1, name: 'Campus', description: null },
  community: {
    id: 4,
    name: 'TAWS',
    slug: 'taws',
    description: null,
  },
  status: { code: 'published', name: 'Publicado' },
  created_at: '2026-08-01T15:00:00.000000Z',
  updated_at: '2026-08-01T15:00:00.000000Z',
}

function LocationProbe() {
  const location = useLocation()

  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  )
}

function renderCatalog(initialEntry = appRoutes.events) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            element={
              <>
                <EventCatalogPage />
                <LocationProbe />
              </>
            }
            path={appRoutes.events}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function referenceHandlers() {
  return [
    http.get(`${apiUrl}/event-categories`, () =>
      HttpResponse.json({ data: [event.category] }),
    ),
    http.get(`${apiUrl}/event-modalities`, () =>
      HttpResponse.json({ data: [event.modality] }),
    ),
    http.get(`${apiUrl}/communities`, () =>
      HttpResponse.json({ data: [event.community] }),
    ),
  ]
}

describe('public event catalog', () => {
  beforeEach(() => {
    server.use(...referenceHandlers())
  })

  it('renders events and debounces search into the URL', async () => {
    const requestedSearches: string[] = []

    server.use(
      http.get(`${apiUrl}/events`, ({ request }) => {
        requestedSearches.push(
          new URL(request.url).searchParams.get('search') ?? '',
        )

        return HttpResponse.json({
          data: [event],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 12,
            total: 1,
          },
        })
      }),
    )

    const user = userEvent.setup()
    renderCatalog()

    expect(
      await screen.findByRole('link', {
        name: 'Ver detalles de Taller Laravel',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Conoce cómo organizar' }),
    ).toHaveAttribute('href', appRoutes.organize)

    await user.type(screen.getByRole('searchbox'), 'laravel')

    await waitFor(() => {
      expect(requestedSearches).toContain('laravel')
      expect(screen.getByTestId('location')).toHaveTextContent(
        `${appRoutes.events}?search=laravel`,
      )
    })
  })
})
