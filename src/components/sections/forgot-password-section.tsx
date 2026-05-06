'use client'

import { useState } from 'react'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNavStore } from '@/store/nav-store'

export function ForgotPasswordSection() {
  const { setCurrentPage } = useNavStore()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(2)
    }, 1500)
  }

  const goToLogin = () => setCurrentPage('login')

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
                  أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة
                  المرور
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ps-10"
                      required
                    />
                    <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="btn-3d-sm w-full"
                  disabled={loading}
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
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
                <p className="text-sm text-muted-foreground">
                  تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك
                  الإلكتروني. يرجى التحقق من صندوق الوارد أو الرسائل
                  غير المرغوب فيها.
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
