import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { OrganizerPage } from '@/features/organizer/pages/OrganizerPage'

vi.mock('@/features/organizer/components/ManagedCommunitiesSection', () => ({
  ManagedCommunitiesSection: () => <div>communities section</div>,
}))

describe('organizer page', () => {
  it('renders the managed communities dashboard shell', () => {
    render(<OrganizerPage />)

    expect(
      screen.getByRole('heading', { name: 'Mis comunidades' }),
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
