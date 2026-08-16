import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useAuth } from '@/features/auth/auth-context'
import { OrganizerPage } from '@/features/organizer/pages/OrganizerPage'

vi.mock('@/features/auth/auth-context', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/features/organizer/components/ManagedCommunitiesSection', () => ({
  ManagedCommunitiesSection: () => <div>communities section</div>,
}))

const mockedUseAuth = vi.mocked(useAuth)

describe('organizer page', () => {
  it('renders the organizer dashboard shell without placeholder data', () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: 7,
        first_name: 'Ana',
        last_name: 'Torres',
        email: 'ana@espol.edu.ec',
        roles: [{ code: 'organizer', name: 'Organizer' }],
      },
      status: 'authenticated',
      error: null,
      isLoggingIn: false,
      isRegistering: false,
      isLoggingOut: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    })

    render(<OrganizerPage />)

    expect(
      screen.getByRole('heading', { name: 'Área del organizador' }),
    ).toBeInTheDocument()
    expect(screen.getByText('communities section')).toBeInTheDocument()
    expect(screen.getByText('Mis eventos')).toBeInTheDocument()
    expect(
      screen.getByText(
        'El panel de eventos estará disponible en la siguiente etapa.',
      ),
    ).toBeInTheDocument()
  })
})
