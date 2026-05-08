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
  needsEmailConfirmation: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  updateProfile: (data: Partial<AuthUser>) => void
  checkSession: () => Promise<void>
  clearError: () => void
  _initAuthListener: () => void
}

function extractUser(user: User, fallbackEmail?: string): AuthUser {
  const meta = user.user_metadata || {}
  return {
    id: user.id,
    name: meta.full_name || meta.name || 'مستخدم',
    email: user.email || fallbackEmail || '',
    phone: meta.phone || '',
    avatar: meta.avatar_url || meta.picture || '',
    role: meta.role || 'user',
  }
}

let authListenerInitialized = false

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  session: null,
  error: null,
  needsEmailConfirmation: false,

  _initAuthListener: () => {
    if (authListenerInitialized || typeof window === 'undefined') return
    authListenerInitialized = true

    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] State changed:', event)

      if (event === 'SIGNED_IN' && session?.user) {
        set({
          user: extractUser(session.user),
          isAuthenticated: true,
          isLoading: false,
          session,
          needsEmailConfirmation: false,
          error: null,
        })
      } else if (event === 'SIGNED_OUT') {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          session: null,
          needsEmailConfirmation: false,
          error: null,
        })
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        set({
          user: extractUser(session.user),
          session,
        })
      } else if (event === 'USER_UPDATED' && session?.user) {
        set({
          user: extractUser(session.user),
          session,
        })
      }
    })
  },

  checkSession: async () => {
    set({ isLoading: true })
    try {
      // Initialize auth listener on first check
      get()._initAuthListener()

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({
          user: extractUser(session.user),
          isAuthenticated: true,
          isLoading: false,
          session,
          needsEmailConfirmation: false,
        })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, session: null })
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false, session: null })
    }
  },

  login: async (email: string, password: string) => {
    set({ error: null, isLoading: true, needsEmailConfirmation: false })
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
          set({ needsEmailConfirmation: true })
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'محاولات كثيرة. حاول مرة أخرى بعد قليل'
        }
        set({ error: errorMessage, isLoading: false })
        return false
      }

      // Auth listener handles the session automatically
      set({ isLoading: false, error: null })
      return true
    } catch {
      set({ error: 'حدث خطأ غير متوقع. حاول مرة أخرى', isLoading: false })
      return false
    }
  },

  register: async (name: string, email: string, password: string, phone?: string) => {
    set({ error: null, isLoading: true, needsEmailConfirmation: false })
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

      // If no session = email confirmation required — DO NOT auto-login
      if (data.user && !data.session) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          session: null,
          needsEmailConfirmation: true,
          error: null,
        })
        return true // Return true so UI shows "check email" message
      }

      // If session exists = auto-confirmed (Supabase setting), auth listener handles it
      if (data.session?.user) {
        set({ isLoading: false, error: null })
        return true
      }

      set({ isLoading: false })
      return false
    } catch {
      set({ error: 'حدث خطأ غير متوقع. حاول مرة أخرى', isLoading: false })
      return false
    }
  },

  loginWithGoogle: async () => {
    set({ error: null, isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      })

      if (error) {
        set({ error: 'فشل الاتصال بجوجل. حاول مرة أخرى.', isLoading: false })
      }
      // If no error, browser will redirect to Google — loading stays true
    } catch {
      set({ error: 'حدث خطأ في الاتصال بجوجل.', isLoading: false })
    }
  },

  loginWithFacebook: async () => {
    set({ error: null, isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      })

      if (error) {
        set({ error: 'فشل الاتصال بفيسبوك. حاول مرة أخرى.', isLoading: false })
      }
      // If no error, browser will redirect to Facebook — loading stays true
    } catch {
      set({ error: 'حدث خطأ في الاتصال بفيسبوك.', isLoading: false })
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Continue with local logout even if Supabase fails
    }
    set({ user: null, isAuthenticated: false, session: null, error: null, needsEmailConfirmation: false })
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
