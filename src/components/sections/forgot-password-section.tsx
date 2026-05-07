'use client'

import { useState } from 'react'
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useNavStore } from '@/store/nav-store'
import { useAuthStore } from '@/store/auth-store'

export function ForgotPasswordSection() {
  const { setCurrentPage } = useNavStore()
  const { resetPassword, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!email.trim()) {
      setLocalError('البريد الإلكتروني مطلوب')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setLocalError('البريد الإلكتروني غير صالح')
      return
    }

    const success = await resetPassword(email.trim())
    if (success) {
      setStep(2)
    }
  }

  const goToLogin = () => {
    clearError()
    setCurrentPage('login')
  }

  const currentError = localError || error

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card-3d p-8">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="cursor-pointer" onClick={() => setCurrentPage('home')}>
              <Logo />
            </div>
          </div>

          {step === 1 ? (
            <>
              {/* Title */}
              <div className="mb-6 text-center">
                <h1 className="mb-2 text-2xl font-bold">
                  نسيت كلمة المرور؟
                </h1>
                <span className="mx-auto mb-4 block h-1 w-16 rounded-full bg-gold-gradient" />
                <p className="text-sm text-muted-foreground">
                  أدخل بريدك الإلكتروني المسجل وسنرسل لك رابط لإعادة تعيين كلمة المرور
                </p>
              </div>

              {/* Error */}
              {currentError && (
                <Alert className="mb-4 border-red-500/30 bg-red-500/5">
                  <AlertCircle className="size-4 text-red-500" />
                  <AlertDescription className="text-sm text-red-600">{currentError}</AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setLocalError(''); clearError() }}
                      dir="ltr"
                      className="text-right ps-10"
                      autoComplete="email"
                      required
                    />
                    <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="btn-3d-sm w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      جاري الإرسال...
                    </span>
                  ) : (
                    'إرسال رابط إعادة التعيين'
                  )}
                </Button>
              </form>

              {/* Back to login */}
              <button
                onClick={goToLogin}
                className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowRight className="size-4" />
                العودة لتسجيل الدخول
              </button>
            </>
          ) : (
            <>
              {/* Success */}
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle className="size-8 text-green-500" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">
                  تم الإرسال بنجاح!
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
                  <span className="block mt-1 font-medium text-foreground" dir="ltr">{email}</span>
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  يرجى التحقق من صندوق الوارد أو مجلد الرسائل غير المرغوب فيها (Spam).
                </p>
              </div>

              <Button
                onClick={goToLogin}
                className="btn-3d-sm mt-6 w-full"
              >
                العودة لتسجيل الدخول
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
