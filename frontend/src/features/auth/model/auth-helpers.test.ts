import { describe, expect, it } from 'vitest'

import {
  buildAuthPath,
  getSafeRedirect,
} from '@/features/auth/model/auth-helpers'

describe('auth redirect helpers', () => {
  it('keeps internal paths with query parameters and hashes', () => {
    expect(getSafeRedirect('/events/7?view=details#registration')).toBe(
      '/events/7?view=details#registration',
    )
  })

  it('rejects external, protocol-relative, and auth-loop redirects', () => {
    expect(getSafeRedirect('https://evil.example')).toBe('/')
    expect(getSafeRedirect('//evil.example')).toBe('/')
    expect(getSafeRedirect('/login')).toBe('/')
    expect(getSafeRedirect('/register')).toBe('/')
  })

  it('preserves a safe redirect when linking between auth pages', () => {
    expect(buildAuthPath('/register', '/events/7?view=details')).toBe(
      '/register?redirect=%2Fevents%2F7%3Fview%3Ddetails',
    )
  })
})
