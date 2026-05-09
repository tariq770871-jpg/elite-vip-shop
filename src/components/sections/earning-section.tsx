"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getEarningMethods } from "@/lib/supabase-data";
import type { FreeItem } from "@/lib/mock-data";
import {
  MoneyIcon,
  AffiliateIcon,
  YoutubeIcon,
  EcommerceIcon,
  FreelancingIcon,
} from "@/components/icons";

const earningIcons = [AffiliateIcon, YoutubeIcon, EcommerceIcon, FreelancingIcon];

export function EarningSection() {
  const [earningData, setEarningData] = useState<FreeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEarningMethods().then(d => { setEarningData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <section className="section-gradient-earning py-6 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="section-title-3d mb-6">
              <span className="title-icon">
                <MoneyIcon className="size-6" />
              </span>
              الربح من الإنترنت
            </div>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              اكتشف أفضل الطرق المجربة لتحقيق دخل إضافي من الإنترنت
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="size-8 animate-spin text-gold-gradient" />
            <p className="text-muted-foreground">جارٍ تحميل الطرق...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-gradient-earning py-6 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="section-title-3d mb-6">
            <span className="title-icon">
              <MoneyIcon className="size-6" />
            </span>
            الربح من الإنترنت
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            اكتشف أفضل الطرق المجربة لتحقيق دخل إضافي من الإنترنت
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {earningData.map((item, index) => {
            const ItemIcon = earningIcons[index] || AffiliateIcon;
            return (
              <div key={item.id} className="card-3d flex flex-col p-6">
                <div className="icon-box mb-5 text-amber-500">
                  <ItemIcon className="size-7" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <button className="btn-3d-sm w-full flex items-center justify-center gap-2">
                  تعلم المزيد
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
