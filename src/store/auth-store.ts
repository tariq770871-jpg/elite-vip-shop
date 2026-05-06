import { create } from 'zustand'

interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'visitor' | 'user' | 'seller' | 'admin'
}

interface AuthStore {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (user: AuthUser) => void
  logout: () => void
  updateProfile: (data: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateProfile: (data) => {
    const user = get().user
    if (user) {
      set({ user: { ...user, ...data } })
    }
  },
}))
