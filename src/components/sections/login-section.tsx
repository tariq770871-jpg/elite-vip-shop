"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth-store";
import { useNavStore } from "@/store/nav-store";

export function LoginSection() {
  const login = useAuthStore((s) => s.login);
  const { setCurrentPage } = useNavStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login({
        id: "user-1",
        name: "مستخدم VIP",
        email: email || "user@example.com",
        role: "user",
      });
      setCurrentPage("home");
      setIsLoading(false);
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      login({
        id: "user-1",
        name: `مستخدم ${provider}`,
        email: `user@${provider}.com`,
        role: "user",
      });
      setCurrentPage("home");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center py-12 px-4 md:px-8">
      <div className="w-full max-w-md card-3d p-8">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="mb-6" />
          <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
          <span className="mt-2 block h-1 w-16 rounded-full bg-gold-gradient" />
          <p className="mt-2 text-sm text-muted-foreground">
            أدخل بياناتك للوصول إلى حسابك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="login-email">البريد الإلكتروني</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="text-right"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">كلمة المرور</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              className="text-right"
              required
            />
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={() => setCurrentPage("forgot-password")}
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          <Button
            type="submit"
            className="btn-3d-sm w-full"
            disabled={isLoading}
          >
            {isLoading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
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
            onClick={() => handleSocialLogin("Google")}
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            تسجيل بجوجل
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2 rounded-lg"
            disabled={isLoading}
            onClick={() => handleSocialLogin("Facebook")}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            تسجيل بفيسبوك
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ليس لديك حساب؟{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => setCurrentPage("register")}
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>
    </section>
  );
}
