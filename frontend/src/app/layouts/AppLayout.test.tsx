import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { AppLayout } from '@/app/layouts/AppLayout'
import { appRoutes } from '@/app/routes'
import { type AuthContextValue, useAuth } from '@/features/auth/auth-context'

vi.mock('@/features/auth/auth-context', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

const defaultAuthValue: AuthContextValue = {
  user: null,
  status: 'anonymous',
  error: null,
  isLoggingIn: false,
  isRegistering: false,
  isLoggingOut: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
}

describe('application layout community navigation', () => {
  it('shows the managed communities link to organizers', () => {
    mockedUseAuth.mockReturnValue({
      ...defaultAuthValue,
      status: 'authenticated',
      user: {
        id: 7,
        first_name: 'Ana',
        last_name: 'Torres',
        email: 'ana@espol.edu.ec',
        is_admin: false,
        community_memberships: [
          {
            community: { id: 1, name: 'TAWS', slug: 'taws' },
            role: { code: 'organizer', name: 'Organizer' },
            status: { code: 'active', name: 'Active' },
            requested_at: null,
            reviewed_at: null,
          },
        ],
      },
    })

    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'Mis comunidades' }),
    ).toHaveAttribute('href', appRoutes.myCommunities)
  })

  it('shows the community onboarding link to students', () => {
    mockedUseAuth.mockReturnValue({
      ...defaultAuthValue,
      status: 'authenticated',
      user: {
        id: 7,
        first_name: 'Ana',
        last_name: 'Torres',
        email: 'ana@espol.edu.ec',
        is_admin: false,
        community_memberships: [],
      },
    })

    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'Organiza una comunidad' }),
    ).toHaveAttribute('href', appRoutes.organize)
  })
})
