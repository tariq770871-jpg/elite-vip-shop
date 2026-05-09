"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { getApps } from "@/lib/supabase-data";
import type { FreeItem } from "@/lib/mock-data";
import {
  SmartphoneIcon,
  TaskManagerIcon,
  PhotoEditorIcon,
  LanguageIcon,
  PdfScannerIcon,
  FitnessIcon,
  BudgetIcon,
} from "@/components/icons";

const appIcons = [TaskManagerIcon, PhotoEditorIcon, LanguageIcon, PdfScannerIcon, FitnessIcon, BudgetIcon];

export function AppsSection() {
  const [appsData, setAppsData] = useState<FreeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApps().then(d => { setAppsData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section-gradient-apps py-6 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="section-title-3d mb-6">
              <span className="title-icon">
                <SmartphoneIcon className="size-6" />
              </span>
              متجر التطبيقات
            </div>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              تطبيقات مجانية مختارة بعناية لتحسين إنتاجيتك
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="size-8 animate-spin text-gold-gradient" />
            <p className="text-muted-foreground">جارٍ تحميل التطبيقات...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-gradient-apps py-6 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="section-title-3d mb-6">
            <span className="title-icon">
              <SmartphoneIcon className="size-6" />
            </span>
            متجر التطبيقات
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            تطبيقات مجانية مختارة بعناية لتحسين إنتاجيتك
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {appsData.map((app, index) => {
            const AppIcon = appIcons[index] || TaskManagerIcon;
            return (
              <div key={app.id} className="card-3d flex flex-col p-6">
                <div className="icon-box mb-5 text-blue-500">
                  <AppIcon className="size-7" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{app.title}</h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">{app.description}</p>
                <div className="flex items-center gap-3">
                  {/* أيقونة جوجل بلاي كزر → تنزيل مباشر */}
                  <button
                    className="rounded-xl p-2 text-green-600 dark:text-green-400 transition-all hover:bg-green-500/15 active:scale-95"
                    title="تنزيل مباشر من متجر بلاي"
                    aria-label="تنزيل مباشر من متجر بلاي"
                    onClick={() => {
                      const url = app.link && app.link !== "#" ? app.link : `https://play.google.com/store/search?q=${encodeURIComponent(app.title)}`;
                      const w = window.open(url, "_blank");
                      if (w) w.opener = null;
                    }}
                  >
                    <svg className="size-9" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.04L13.62 12.6 3.18 2.16c-.12.12-.18.28-.18.46v19.96c0 .18.06.34.18.46zm1.46.96l11.44-6.62-2.52-2.52-8.92 9.14zm0-23.96l8.92 9.14 2.52-2.52L4.64.04zM17.36 9.18l-2.72 1.58 2.72 1.58 3.18-1.58-3.18-1.58zm-2.72 2.8l-2.52 2.52 2.52 2.52 3.18-1.58-3.18-3.46z"/></svg>
                  </button>
                  {/* أيقونة تيليجرام كزر → استفسار عن التطبيق */}
                  <button
                    className="rounded-xl p-2 text-sky-500 transition-all hover:bg-sky-500/15 active:scale-95"
                    title="استفسار عن التطبيق عبر تيليجرام"
                    aria-label="استفسار عن التطبيق عبر تيليجرام"
                    onClick={() => {
                      const w = window.open(`https://t.me/EliteVipShopBot?start=${encodeURIComponent(app.title)}`, "_blank");
                      if (w) w.opener = null;
                    }}
                  >
                    <svg className="size-9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.65-2.89 7.99-3.44 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
