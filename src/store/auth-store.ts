import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'visitor' | 'user' | 'seller' | 'admin' | 'owner'
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
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error: string | null }>
  checkSession: () => Promise<void>
  clearError: () => void
  _initAuthListener: () => void
}

function extractUser(user: User, fallbackEmail?: string, serverRole?: string): AuthUser {
  const meta = user.user_metadata || {}
  return {
    id: user.id,
    name: meta.full_name || meta.name || 'مستخدم',
    email: user.email || fallbackEmail || '',
    phone: meta.phone || '',
    avatar: meta.avatar_url || meta.picture || '',
    // Never trust user_metadata.role — use server-verified role from users table
    // Fallback to 'user' only if server role is not yet fetched
    role: (serverRole as 'visitor' | 'user' | 'seller' | 'admin' | 'owner') || 'user',
  }
}

let authListenerInitialized = false
// Flag to suppress the SIGNED_IN auth listener during password change.
// signInWithPassword (used to verify the current password) fires SIGNED_IN,
// which would otherwise reset user state and trigger an unnecessary role fetch.
let suppressAuthEvents = false

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  session: null,
  error: null,
  needsEmailConfirmation: false,

  _initAuthListener: () => {
    if (authListenerInitialized || typeof window === 'undefined') return
    if (!supabase) { set({ isLoading: false }); return }
    authListenerInitialized = true

    // Fetch user role from server (users table) instead of trusting user_metadata
    const fetchServerRole = async (email: string): Promise<string | undefined> => {
      try {
        const res = await fetch('/api/auth/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (res.ok) {
          const data = await res.json()
          return data.role
        }
      } catch (err) {
        // Non-critical — fallback to default role 'user'; log for monitoring
        console.warn('Failed to fetch user role:', err instanceof Error ? err.message : String(err))
      }
      return undefined
    }

    supabase.auth.onAuthStateChange((event, session) => {
      // Suppress SIGNED_IN during password change flow (see changePassword)
      if (suppressAuthEvents && event === 'SIGNED_IN') return
      if (event === 'SIGNED_IN' && session?.user) {
        // Set user immediately with default role, then update with server role
        set({
          user: extractUser(session.user),
          isAuthenticated: true,
          isLoading: false,
          session,
          needsEmailConfirmation: false,
          error: null,
        })
        // Fetch real role from server asynchronously
        fetchServerRole(session.user.email || '').then((role) => {
          if (role) {
            const currentUser = get().user
            if (currentUser?.id === session.user.id) {
              set({ user: { ...currentUser, role: role as 'visitor' | 'user' | 'seller' | 'admin' | 'owner' } })
            }
          }
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
        const currentUser = get().user
        set({
          user: extractUser(session.user, undefined, currentUser?.role),
          session,
        })
      } else if (event === 'USER_UPDATED' && session?.user) {
        const currentUser = get().user
        set({
          user: extractUser(session.user, undefined, currentUser?.role),
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

      if (!supabase) { set({ isLoading: false }); return }
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
    if (!supabase) { set({ error: 'النظام غير متاح حالياً', isLoading: false }); return false }
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
    if (!supabase) { set({ error: 'النظام غير متاح حالياً', isLoading: false }); return false }
    try {
      // ⚠️ Never put `role` in user_metadata — clients can read and tamper with it.
      // The authoritative role lives in public.users / public.profiles and is
      // fetched server-side via /api/auth/role. Storing role client-side here
      // violates the distrust principle (extractUser already ignores it).
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
            phone: phone || '',
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
    if (!supabase) { set({ error: 'النظام غير متاح حالياً', isLoading: false }); return }
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
    if (!supabase) { set({ error: 'النظام غير متاح حالياً', isLoading: false }); return }
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
      if (supabase) await supabase.auth.signOut()
    } catch {
      // Continue with local logout even if Supabase fails
    }
    set({ user: null, isAuthenticated: false, session: null, error: null, needsEmailConfirmation: false })
  },

  resetPassword: async (email: string) => {
    set({ error: null, isLoading: true })
    if (!supabase) { set({ error: 'النظام غير متاح حالياً', isLoading: false }); return false }
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

  updateProfile: async (data: Partial<AuthUser>) => {
    const user = get().user
    if (!user) return
    if (!supabase) { set({ error: 'النظام غير متاح' }); return }
    try {
      const updates: Record<string, string> = {}
      if (data.name) updates.full_name = data.name
      if (data.name) updates.name = data.name
      if (data.phone !== undefined) updates.phone = data.phone
      const { error } = await supabase.auth.updateUser({ data: updates })
      if (error) throw error
      set({ user: { ...user, ...data } })
    } catch {
      // Keep local state even if Supabase fails
      set({ user: { ...user, ...data } })
    }
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      if (!supabase) return { success: false, error: 'النظام غير متاح' }
      // Verify current password by re-signing in
      const email = get().user?.email
      if (!email) return { success: false, error: 'البريد الإلكتروني غير متوفر' }
      // Suppress the SIGNED_IN side effects (state reset + role fetch) that
      // signInWithPassword would otherwise trigger. The user is already signed in;
      // this re-authentication is purely to verify the current password.
      suppressAuthEvents = true
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
        if (signInError) return { success: false, error: 'كلمة المرور الحالية غير صحيحة' }
        // Update password
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
        if (updateError) return { success: false, error: 'فشل تحديث كلمة المرور' }
        return { success: true, error: null }
      } finally {
        suppressAuthEvents = false
      }
    } catch {
      return { success: false, error: 'حدث خطأ غير متوقع' }
    }
  },

  clearError: () => set({ error: null }),
}))
