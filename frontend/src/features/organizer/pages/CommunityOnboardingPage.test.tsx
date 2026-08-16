import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { appRoutes } from '@/app/routes'
import { type AuthContextValue, useAuth } from '@/features/auth/auth-context'
import { CommunityOnboardingPage } from '@/features/organizer/pages/CommunityOnboardingPage'
import { server } from '@/test/server'

vi.mock('@/features/auth/auth-context', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)
const apiUrl = 'http://localhost:8000/api'

const community = {
  id: 4,
  name: 'Club de Robótica',
  slug: 'club-de-robotica',
  description: 'Comunidad de robótica de ESPOL.',
  image_url: null,
  status: { code: 'pending', name: 'Pendiente' },
  requested_at: '2026-08-16T20:00:00.000000Z',
  reviewed_at: null,
  rejection_reason: null,
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
      is_admin: false,
      community_memberships: [],
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

function renderOnboarding() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[appRoutes.createCommunity]}>
        <Routes>
          <Route
            element={<CommunityOnboardingPage />}
            path={appRoutes.createCommunity}
          />
          <Route
            element={<div>managed communities</div>}
            path={appRoutes.myCommunities}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function fillCommunityDetails(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole('button', { name: /Registrar una comunidad nueva/ }),
  )
  await user.type(
    screen.getByRole('textbox', { name: 'Nombre de la comunidad' }),
    'Club de Robótica',
  )
  await user.type(
    screen.getByRole('textbox', { name: /Descripción/ }),
    'Comunidad de robótica de ESPOL.',
  )
  await user.click(screen.getByRole('button', { name: 'Revisar información' }))
}

describe('community onboarding page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(createAuthValue())
  })

  it('guides a student through the three steps and registers the community only after confirmation', async () => {
    const refresh = vi.fn(async () => undefined)
    mockedUseAuth.mockReturnValue(createAuthValue({ refresh }))
    let createRequests = 0
    document.cookie = 'XSRF-TOKEN=csrf-token; path=/'

    server.use(
      http.post(
        `${apiUrl}/community-creation-requests`,
        async ({ request }) => {
          createRequests += 1
          expect(await request.json()).toEqual({
            description: 'Comunidad de robótica de ESPOL.',
            name: 'Club de Robótica',
          })
          return HttpResponse.json({ data: community }, { status: 201 })
        },
      ),
    )

    const user = userEvent.setup()
    renderOnboarding()

    expect(
      screen.getByRole('heading', { name: 'Registra tu comunidad' }),
    ).toBeInTheDocument()
    await fillCommunityDetails(user)

    expect(
      screen.getByRole('heading', { name: 'Revisa antes de continuar' }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Registrar comunidad' }),
    )
    expect(
      screen.getByText(
        'Confirma que formas parte de esta comunidad para continuar.',
      ),
    ).toBeInTheDocument()
    expect(createRequests).toBe(0)

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirmo que formo parte de esta comunidad y puedo representarla en PoliLink.',
      }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Registrar comunidad' }),
    )

    expect(
      await screen.findByText('Club de Robótica está lista'),
    ).toBeInTheDocument()
    expect(refresh).toHaveBeenCalledOnce()
    expect(createRequests).toBe(1)
  })

  it('validates the community details before moving to confirmation', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(
      screen.getByRole('button', { name: /Registrar una comunidad nueva/ }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Revisar información' }),
    )

    expect(
      await screen.findByText('Ingresa el nombre de la comunidad.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Revisa antes de continuar' }),
    ).not.toBeInTheDocument()
  })

  it('returns to the details step after a backend validation error', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-token; path=/'

    server.use(
      http.post(`${apiUrl}/community-creation-requests`, () =>
        HttpResponse.json(
          { errors: { name: ['Esta comunidad ya existe.'] } },
          { status: 422 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderOnboarding()
    await fillCommunityDetails(user)
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirmo que formo parte de esta comunidad y puedo representarla en PoliLink.',
      }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Registrar comunidad' }),
    )

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: 'Nombre de la comunidad' }),
      ).toHaveValue('Club de Robótica')
    })
    expect(screen.getByText('Esta comunidad ya existe.')).toBeInTheDocument()
    expect(screen.getByText('Revisa los datos ingresados.')).toBeInTheDocument()
  })
})
