export const MIN_PASSWORD_LENGTH = 12

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `كلمة المرور يجب أن تكون ${MIN_PASSWORD_LENGTH} حرفًا على الأقل`
  }

  return null
}
