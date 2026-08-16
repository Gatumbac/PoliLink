import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type AuthContextValue, useAuth } from '@/features/auth/auth-context'
import { ManagedCommunitiesSection } from '@/features/organizer/components/ManagedCommunitiesSection'
import { server } from '@/test/server'

vi.mock('@/features/auth/auth-context', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)
const apiUrl = 'http://localhost:8000/api'
const backendUrl = 'http://localhost:8000'

const community = {
  id: 4,
  name: 'Club de Robótica',
  description: 'Comunidad de robótica de ESPOL.',
}

function createAuthValue(
  overrides: Partial<AuthContextValue> = {},
): AuthContextValue {
  return {
    user: {
      id: 7,
      first_name: 'Ana',
      last_name: 'Torres',
      email: 'ana@espol.edu.ec',
      roles: [{ code: 'student', name: 'Student' }],
    },
    status: 'authenticated',
    error: null,
    isLoggingIn: false,
    isRegistering: false,
    isLoggingOut: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(async () => undefined),
    ...overrides,
  }
}

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ManagedCommunitiesSection />
    </QueryClientProvider>,
  )
}

describe('managed communities section', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(createAuthValue())
  })

  it('shows the inline onboarding form and refreshes after creation', async () => {
    let listRequests = 0
    const refresh = vi.fn(async () => undefined)
    mockedUseAuth.mockReturnValue(createAuthValue({ refresh }))
    document.cookie = 'XSRF-TOKEN=csrf-token; path=/'

    server.use(
      http.get(`${apiUrl}/me/communities`, () => {
        listRequests += 1
        return HttpResponse.json({
          data: listRequests === 1 ? [] : [community],
        })
      }),
      http.post(`${apiUrl}/communities`, async ({ request }) => {
        expect(await request.json()).toEqual({
          description: 'Comunidad de robótica de ESPOL.',
          name: 'Club de Robótica',
        })
        return HttpResponse.json({ data: community }, { status: 201 })
      }),
    )

    const user = userEvent.setup()
    renderSection()

    await user.type(
      await screen.findByRole('textbox', {
        name: 'Nombre de la comunidad',
      }),
      'Club de Robótica',
    )
    await user.type(
      screen.getByRole('textbox', {
        name: /Descripción/,
      }),
      'Comunidad de robótica de ESPOL.',
    )
    await user.click(screen.getByRole('button', { name: 'Crear comunidad' }))

    await waitFor(() => {
      expect(screen.getByText('Club de Robótica')).toBeInTheDocument()
    })
    expect(refresh).toHaveBeenCalledOnce()
    expect(listRequests).toBeGreaterThanOrEqual(2)
  })

  it('lists existing communities and opens the creation dialog', async () => {
    server.use(
      http.get(`${apiUrl}/me/communities`, () =>
        HttpResponse.json({ data: [community] }),
      ),
    )

    const user = userEvent.setup()
    renderSection()

    expect(await screen.findByText('Club de Robótica')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Nueva comunidad' }))

    expect(
      screen.getByRole('heading', { name: 'Nueva comunidad' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Nombre de la comunidad' }),
    ).toBeInTheDocument()
  })

  it('renders a backend validation error on the community name', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-token; path=/'

    server.use(
      http.get(`${apiUrl}/me/communities`, () =>
        HttpResponse.json({ data: [] }),
      ),
      http.post(`${apiUrl}/communities`, () =>
        HttpResponse.json(
          { errors: { name: ['Esta comunidad ya existe.'] } },
          { status: 422 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderSection()

    await user.type(
      await screen.findByRole('textbox', {
        name: 'Nombre de la comunidad',
      }),
      'Club de Robótica',
    )
    await user.click(screen.getByRole('button', { name: 'Crear comunidad' }))

    expect(
      await screen.findByText('Esta comunidad ya existe.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Revisa los datos ingresados.')).toBeInTheDocument()
  })

  it('uses the CSRF cookie endpoint when creating without a token', async () => {
    let csrfRequests = 0
    server.use(
      http.get(`${apiUrl}/me/communities`, () =>
        HttpResponse.json({ data: [] }),
      ),
      http.get(`${backendUrl}/sanctum/csrf-cookie`, () => {
        csrfRequests += 1
        document.cookie = 'XSRF-TOKEN=csrf-token; path=/'
        return new HttpResponse(null, { status: 204 })
      }),
      http.post(`${apiUrl}/communities`, () =>
        HttpResponse.json({ data: community }, { status: 201 }),
      ),
    )

    const user = userEvent.setup()
    renderSection()

    await user.type(
      await screen.findByRole('textbox', {
        name: 'Nombre de la comunidad',
      }),
      'Club de Robótica',
    )
    await user.click(screen.getByRole('button', { name: 'Crear comunidad' }))

    await waitFor(() => expect(csrfRequests).toBe(1))
  })
})
