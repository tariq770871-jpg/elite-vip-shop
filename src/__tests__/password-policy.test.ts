import { describe, expect, it } from 'vitest'
import { MIN_PASSWORD_LENGTH, validatePassword } from '@/lib/password-policy'

describe('password policy', () => {
  it('requires the configured minimum length', () => {
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toContain(String(MIN_PASSWORD_LENGTH))
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH))).toBeNull()
  })

  it('accepts long passwords without imposing brittle composition rules', () => {
    expect(validatePassword('كلمة مرور آمنة وطويلة')).toBeNull()
  })

  it('returns a clear Arabic message for short passwords', () => {
    expect(validatePassword('short')).toBe(`كلمة المرور يجب أن تكون ${MIN_PASSWORD_LENGTH} حرفًا على الأقل`)
  })
})
