import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '@/App'

describe('application shell', () => {
  it('renders the event catalog route', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'PoliLink' }),
    ).toBeInTheDocument()
  })
})
