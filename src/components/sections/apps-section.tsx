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
                <button
                  className="btn-3d-sm w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    const url = app.link && app.link !== "#" ? app.link : `https://wa.me/967782138587?text=${encodeURIComponent("أرغب في الحصول على: " + app.title)}`;
                    const w = window.open(url, "_blank");
                    if (w) w.opener = null;
                  }}
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.04L13.62 12.6 3.18 2.16c-.12.12-.18.28-.18.46v19.96c0 .18.06.34.18.46zm1.46.96l11.44-6.62-2.52-2.52-8.92 9.14zm0-23.96l8.92 9.14 2.52-2.52L4.64.04zM17.36 9.18l-2.72 1.58 2.72 1.58 3.18-1.58-3.18-1.58zm-2.72 2.8l-2.52 2.52 2.52 2.52 3.18-1.58-3.18-3.46z"/></svg>
                  تنزيل من متجر بلاي
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
