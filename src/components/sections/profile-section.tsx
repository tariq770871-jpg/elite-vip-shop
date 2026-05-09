"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useNavigation } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, LogIn, Save, Lock, CheckCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const roleLabels: Record<string, string> = {
  admin: "مدير",
  seller: "بائع",
  user: "مستخدم",
  visitor: "زائر",
};

const roleBadgeClass: Record<string, string> = {
  admin: "bg-gold-gradient text-black font-bold",
  seller: "bg-amber-600 text-white",
  user: "bg-secondary text-secondary-foreground",
  visitor: "bg-secondary text-secondary-foreground",
};

/* ------------------------------------------------------------------ */
/*  Main Profile Section                                                */
/* ------------------------------------------------------------------ */

export function ProfileSection() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const { navigateTo } = useNavigation();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({ name, phone });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("يرجى ملء جميع الحقول");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setChangingPassword(false);

    if (result.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2500);
    } else {
      setPasswordError(result.error || "فشل تغيير كلمة المرور");
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <LogIn className="size-8 text-muted-foreground" />
        </div>
        <div className="section-title-3d">
          <span className="title-icon">
            <User className="size-6" />
          </span>
          الملف الشخصي
        </div>
        <p className="text-muted-foreground">سجل دخولك للوصول إلى الملف الشخصي</p>
        <Button className="btn-3d-sm" onClick={() => navigateTo("login")}>
          <LogIn className="ms-2 size-4" />
          تسجيل الدخول
        </Button>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Title */}
        <div className="section-title-3d mb-2">
          <span className="title-icon">
            <User className="size-6" />
          </span>
          الملف الشخصي
        </div>
        <span className="mb-8 block h-1 w-16 rounded-full bg-gold-gradient" />

        {/* Profile Header */}
        <div className="flex items-center gap-4 card-3d p-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-gold-gradient">
            <User className="size-7 text-black" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold">{user.name}</h2>
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${roleBadgeClass[user.role]}`}>
                {roleLabels[user.role]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground" dir="ltr">{user.email}</p>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="card-3d p-6">
          <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
            <User className="size-5" />
            تعديل المعلومات
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="profile-name">الاسم الكامل</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الكامل"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">البريد الإلكتروني</Label>
              <Input
                id="profile-email"
                value={user.email}
                disabled
                dir="ltr"
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">رقم الهاتف</Label>
              <Input
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                dir="ltr"
              />
            </div>
            <Button type="submit" className="btn-3d-sm gap-2">
              {saved ? (
                <>
                  <CheckCircle className="size-4" />
                  تم الحفظ
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card-3d p-6">
          <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
            <Lock className="size-5" />
            تغيير كلمة المرور
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password">كلمة المرور الحالية</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                required
              />
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            <Button type="submit" className="btn-3d-sm gap-2">
              {passwordSaved ? (
                <>
                  <CheckCircle className="size-4" />
                  تم تغيير كلمة المرور
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  تغيير كلمة المرور
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
