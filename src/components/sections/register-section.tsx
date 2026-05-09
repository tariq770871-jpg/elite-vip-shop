"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth-store";
import { useNavigation } from "@/lib/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Mail, ArrowRight } from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, text: "ضعيفة", color: "bg-red-500" };
    if (score <= 2) return { level: 2, text: "متوسطة", color: "bg-amber-500" };
    if (score <= 3) return { level: 3, text: "جيدة", color: "bg-yellow-500" };
    if (score <= 4) return { level: 4, text: "قوية", color: "bg-green-500" };
    return { level: 5, text: "قوية جداً", color: "bg-emerald-500" };
  };

  const { level, text, color } = getStrength();
  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < level ? color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">قوة كلمة المرور: <span className="font-medium">{text}</span></p>
    </div>
  );
}

export function RegisterSection() {
  const { register, loginWithGoogle, loginWithFacebook, isAuthenticated, isLoading, error, clearError, needsEmailConfirmation, checkSession } = useAuthStore();
  const { navigateTo } = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated) {
      navigateTo("home");
    }
  }, [isAuthenticated, navigateTo]);

  const getError = () => localError || error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();
    setSuccessMessage("");

    if (!name.trim() || name.trim().length < 2) {
      setLocalError("الاسم مطلوب ويجب أن يكون حرفين على الأقل");
      return;
    }

    if (!email.trim()) {
      setLocalError("البريد الإلكتروني مطلوب");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("البريد الإلكتروني غير صالح");
      return;
    }

    if (phone && !/^[\+]?[0-9\s\-]{7,15}$/.test(phone)) {
      setLocalError("رقم الهاتف غير صالح");
      return;
    }

    if (password.length < 6) {
      setLocalError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("كلمتا المرور غير متطابقتين");
      return;
    }

    setRegisteredEmail(email.trim());
    const success = await register(name.trim(), email.trim(), password, phone.trim() || undefined);

    if (success && needsEmailConfirmation) {
      // Email confirmation needed — stay on page, show message
      return;
    }

    if (success) {
      setSuccessMessage("تم إنشاء الحساب بنجاح! مرحباً بك في متجر النخبة.");
      setTimeout(() => navigateTo("home"), 1500);
    }
  };

  const currentError = getError();

  // Show email confirmation screen
  if (needsEmailConfirmation && registeredEmail && !isAuthenticated) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center py-12 px-4 md:px-8">
        <div className="w-full max-w-md card-3d p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-blue-500/10">
              <Mail className="size-10 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">تحقق من بريدك الإلكتروني</h1>
            <span className="mx-auto mb-4 block h-1 w-16 rounded-full bg-gold-gradient" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              تم إرسال رابط تفعيل الحساب إلى بريدك الإلكتروني
            </p>
            <p className="mt-3 text-base font-bold" dir="ltr" style={{ color: "#f0d078" }}>
              {registeredEmail}
            </p>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              تحقق من صندوق الوارد أو مجلد الرسائل غير المرغوب فيها (Spam).<br />
              بعد التفعيل، سجل دخولك باستخدام البريد وكلمة المرور.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigateTo("login")}
              className="btn-3d-sm w-full"
            >
              <ArrowRight className="ms-2 size-4" />
              الذهاب لتسجيل الدخول
            </Button>
            <button
              onClick={() => {
                useAuthStore.setState({ needsEmailConfirmation: false });
                setRegisteredEmail("");
              }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              إنشاء حساب ببريد آخر
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center py-12 px-4 md:px-8">
      <div className="w-full max-w-md card-3d p-8">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="mb-6" />
          <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
          <span className="mt-2 block h-1 w-16 rounded-full bg-gold-gradient" />
          <p className="mt-2 text-sm text-muted-foreground">
            انضم إلينا واستمتع بتجربة تسوق فريدة
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-500/30 bg-green-500/5">
            <CheckCircle2 className="size-4 text-green-500" />
            <AlertDescription className="text-sm text-green-600">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {currentError && (
          <Alert className="mb-6 border-red-500/30 bg-red-500/5">
            <AlertCircle className="size-4 text-red-500" />
            <AlertDescription className="text-sm text-red-600">{currentError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name">الاسم الكامل</Label>
            <Input
              id="reg-name"
              type="text"
              placeholder="أدخل اسمك الكامل"
              value={name}
              onChange={(e) => { setName(e.target.value); setLocalError(""); clearError(); }}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email">البريد الإلكتروني</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setLocalError(""); clearError(); }}
              dir="ltr"
              className="text-right"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-phone">رقم الهاتف (اختياري)</Label>
            <Input
              id="reg-phone"
              type="tel"
              placeholder="+967 XXX XXX XXX"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setLocalError(""); }}
              dir="ltr"
              className="text-right"
              autoComplete="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="6 أحرف على الأقل"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLocalError(""); clearError(); }}
                dir="ltr"
                className="text-left pe-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-confirm-password">تأكيد كلمة المرور</Label>
            <div className="relative">
              <Input
                id="reg-confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="أعد كتابة كلمة المرور"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(""); clearError(); }}
                dir="ltr"
                className="text-left pe-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-[11px] text-red-500">كلمتا المرور غير متطابقتين</p>
            )}
            {confirmPassword && confirmPassword === password && (
              <p className="flex items-center gap-1 text-[11px] text-green-500">
                <CheckCircle2 className="size-3" />
                متطابقتان
              </p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 size-4 rounded border-border accent-primary"
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
              أوافق على{" "}
              <button
                type="button"
                onClick={() => navigateTo("terms")}
                className="text-primary hover:underline font-medium"
              >
                شروط الاستخدام
              </button>{" "}
              و{" "}
              <button
                type="button"
                onClick={() => navigateTo("privacy")}
                className="text-primary hover:underline font-medium"
              >
                سياسة الخصوصية
              </button>
            </label>
          </div>

          <Button
            type="submit"
            className="btn-3d-sm w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                جارٍ إنشاء الحساب...
              </span>
            ) : (
              "إنشاء حساب"
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">أو</span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2 rounded-lg"
            disabled={isLoading}
            onClick={loginWithGoogle}
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                جارٍ الاتصال بجوجل...
              </span>
            ) : (
              "تسجيل بجوجل"
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2 rounded-lg"
            disabled={isLoading}
            onClick={loginWithFacebook}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                جارٍ الاتصال بفيسبوك...
              </span>
            ) : (
              "تسجيل بفيسبوك"
            )}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          لديك حساب؟{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => navigateTo("login")}
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </section>
  );
}
