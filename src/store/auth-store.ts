import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

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
  isLoading: boolean
  session: Session | null
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  updateProfile: (data: Partial<AuthUser>) => void
  checkSession: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  session: null,
  error: null,

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const meta = session.user.user_metadata || {}
        set({
          user: {
            id: session.user.id,
            name: meta.full_name || meta.name || 'مستخدم',
            email: session.user.email || '',
            phone: meta.phone || '',
            avatar: meta.avatar_url || session.user.user_metadata?.avatar_url || '',
            role: meta.role || 'user',
          },
          isAuthenticated: true,
          isLoading: false,
          session,
        })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, session: null })
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false, session: null })
    }
  },

  login: async (email: string, password: string) => {
    set({ error: null, isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        let errorMessage = 'حدث خطأ في تسجيل الدخول'
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'البريد الإلكتروني غير مفعّل. تحقق من بريدك الإلكتروني لتفعيل الحساب'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'محاولات كثيرة. حاول مرة أخرى بعد قليل'
        }
        set({ error: errorMessage, isLoading: false })
        return false
      }

      const meta = data.user.user_metadata || {}
      set({
        user: {
          id: data.user.id,
          name: meta.full_name || meta.name || 'مستخدم',
          email: data.user.email || email,
          phone: meta.phone || '',
          avatar: meta.avatar_url || '',
          role: meta.role || 'user',
        },
        isAuthenticated: true,
        isLoading: false,
        session: data.session,
        error: null,
      })
      return true
    } catch {
      set({ error: 'حدث خطأ غير متوقع. حاول مرة أخرى', isLoading: false })
      return false
    }
  },

  register: async (name: string, email: string, password: string, phone?: string) => {
    set({ error: null, isLoading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
            phone: phone || '',
            role: 'user',
          },
        },
      })

      if (error) {
        let errorMessage = 'حدث خطأ في إنشاء الحساب'
        if (error.message.includes('already registered')) {
          errorMessage = 'البريد الإلكتروني مسجل مسبقاً. جرّب تسجيل الدخول أو استخدم بريد آخر'
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        } else if (error.message.includes('valid email')) {
          errorMessage = 'البريد الإلكتروني غير صالح'
        }
        set({ error: errorMessage, isLoading: false })
        return false
      }

      // User might need email confirmation
      if (data.user && !data.session) {
        set({
          user: {
            id: data.user.id,
            name: name,
            email: email,
            phone: phone || '',
            role: 'user',
          },
          isAuthenticated: true,
          isLoading: false,
          session: null,
          error: null,
        })
        return true
      }

      if (data.session?.user) {
        const meta = data.user.user_metadata || {}
        set({
          user: {
            id: data.user.id,
            name: meta.full_name || name,
            email: email,
            phone: phone || '',
            role: 'user',
          },
          isAuthenticated: true,
          isLoading: false,
          session: data.session,
          error: null,
        })
        return true
      }

      set({ isLoading: false })
      return false
    } catch {
      set({ error: 'حدث خطأ غير متوقع. حاول مرة أخرى', isLoading: false })
      return false
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Continue with local logout even if Supabase fails
    }
    set({ user: null, isAuthenticated: false, session: null, error: null })
  },

  resetPassword: async (email: string) => {
    set({ error: null, isLoading: true })
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`,
      })

      if (error) {
        let errorMessage = 'حدث خطأ في إعادة تعيين كلمة المرور'
        if (error.message.includes('User not found')) {
          errorMessage = 'البريد الإلكتروني غير مسجل لدينا'
        }
        set({ error: errorMessage, isLoading: false })
        return false
      }

      set({ isLoading: false, error: null })
      return true
    } catch {
      set({ error: 'حدث خطأ غير متوقع', isLoading: false })
      return false
    }
  },

  updateProfile: (data) => {
    const user = get().user
    if (user) {
      set({ user: { ...user, ...data } })
    }
  },

  clearError: () => set({ error: null }),
}))
