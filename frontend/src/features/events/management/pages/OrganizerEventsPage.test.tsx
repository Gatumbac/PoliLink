import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import {
  type InitialEntry,
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { appRoutes } from '@/app/routes'
import { OrganizerEventsPage } from '@/features/events/management/pages/OrganizerEventsPage'
import { server } from '@/test/server'

const apiUrl = 'http://localhost:8000/api'

const publishedEvent = {
  id: 7,
  title: 'Taller Laravel',
  description: 'Introducción a Laravel.',
  image_url: 'http://localhost:8000/storage/events/laravel.webp',
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

const cancelledEvent = {
  ...publishedEvent,
  id: 8,
  title: 'Encuentro cancelado',
  image_url: null,
  status: { code: 'cancelled', name: 'Cancelado' },
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

function renderPage(initialEntry: InitialEntry = appRoutes.myEvents) {
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
                <OrganizerEventsPage />
                <LocationProbe />
              </>
            }
            path={appRoutes.myEvents}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('organizer events page', () => {
  beforeEach(() => {
    server.use(
      http.get(`${apiUrl}/me/events`, () =>
        HttpResponse.json({
          data: [publishedEvent, cancelledEvent],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 12,
            total: 2,
          },
        }),
      ),
    )
  })

  it('renders published and cancelled events with the correct public link behavior', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'Mis eventos' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Publicado')).toBeInTheDocument()
    expect(await screen.findByText('Cancelado')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver detalles de Taller Laravel' }),
    ).toHaveAttribute('href', appRoutes.eventDetail(publishedEvent.id))
    expect(
      screen.getByRole('link', { name: 'Editar evento Taller Laravel' }),
    ).toHaveAttribute('href', appRoutes.editEvent(publishedEvent.id))
    expect(
      screen.queryByRole('link', {
        name: 'Ver detalles de Encuentro cancelado',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Editar evento Encuentro cancelado' }),
    ).not.toBeInTheDocument()
    expect(screen.getByAltText('Portada de Taller Laravel')).toBeInTheDocument()
  })

  it('requests and persists the selected page', async () => {
    const requestedPages: string[] = []

    server.use(
      http.get(`${apiUrl}/me/events`, ({ request }) => {
        const query = new URL(request.url).searchParams
        requestedPages.push(query.get('page') ?? '')

        return HttpResponse.json({
          data: [publishedEvent],
          meta: {
            current_page: Number(query.get('page') ?? '1'),
            last_page: 2,
            per_page: 12,
            total: 13,
          },
        })
      }),
    )

    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Taller Laravel')
    await user.click(screen.getByRole('button', { name: 'Página 2' }))

    await waitFor(() => {
      expect(requestedPages).toContain('2')
      expect(screen.getByTestId('location')).toHaveTextContent(
        `${appRoutes.myEvents}?page=2`,
      )
    })
  })

  it('shows an empty state when the organizer has no events', async () => {
    server.use(
      http.get(`${apiUrl}/me/events`, () =>
        HttpResponse.json({
          data: [],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 12,
            total: 0,
          },
        }),
      ),
    )

    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'Aún no tienes eventos' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver mis comunidades' }),
    ).toHaveAttribute('href', appRoutes.myCommunities)
  })

  it('shows the publication confirmation after creating an event', async () => {
    renderPage({
      pathname: appRoutes.myEvents,
      state: { createdEventTitle: 'Taller Laravel' },
    })

    expect(
      await screen.findByText('Evento publicado correctamente'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        '“Taller Laravel” ya está disponible para los estudiantes.',
      ),
    ).toBeInTheDocument()
  })

  it('shows the update confirmation after editing an event', async () => {
    renderPage({
      pathname: appRoutes.myEvents,
      state: {
        eventNotice: { action: 'updated', title: 'Taller Laravel' },
      },
    })

    expect(
      await screen.findByText('Evento actualizado correctamente'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        '“Taller Laravel” conserva su publicación con la información actualizada.',
      ),
    ).toBeInTheDocument()
  })

  it('shows a retry action when the event request fails', async () => {
    server.use(
      http.get(`${apiUrl}/me/events`, () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )

    renderPage()

    expect(
      await screen.findByText('No se pudieron cargar tus eventos'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reintentar' }),
    ).toBeInTheDocument()
  })
})
