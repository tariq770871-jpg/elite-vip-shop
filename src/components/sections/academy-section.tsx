"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getAcademyCourses } from "@/lib/supabase-data";
import type { FreeItem } from "@/lib/mock-data";
import {
  GraduationCapIcon,
  TradingBasicsIcon,
  CryptoIcon,
  RiskShieldIcon,
  BrainIcon,
} from "@/components/icons";

const academyIcons = [TradingBasicsIcon, CryptoIcon, RiskShieldIcon, BrainIcon];

export function AcademySection() {
  const [academyData, setAcademyData] = useState<FreeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAcademyCourses().then(d => { setAcademyData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <section className="section-gradient-academy py-6 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="section-title-3d mb-6">
              <span className="title-icon">
                <GraduationCapIcon className="size-6" />
              </span>
              أكاديمية التداول
            </div>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              تعلم التداول من الصفر حتى الاحتراف مع نخبة من الخبراء
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="size-8 animate-spin text-gold-gradient" />
            <p className="text-muted-foreground">جارٍ تحميل الدورات...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-gradient-academy py-6 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="section-title-3d mb-6">
            <span className="title-icon">
              <GraduationCapIcon className="size-6" />
            </span>
            أكاديمية التداول
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            تعلم التداول من الصفر حتى الاحتراف مع نخبة من الخبراء
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {academyData.map((course, index) => {
            const CourseIcon = academyIcons[index] || TradingBasicsIcon;
            return (
              <div key={course.id} className="card-3d flex flex-col p-6">
                <div className="icon-box mb-5 text-emerald-500">
                  <CourseIcon className="size-7" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{course.title}</h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
                <button className="btn-3d-sm w-full flex items-center justify-center gap-2">
                  ابدأ التعلم
                  <ArrowLeft className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
