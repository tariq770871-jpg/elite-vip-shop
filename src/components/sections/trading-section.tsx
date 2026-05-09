"use client";

import { useState } from "react";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { tradingData } from "@/lib/mock-data";
import { TradingBasicsIcon, RiskShieldIcon, BrainIcon, CryptoIcon, FreelancingIcon } from "@/components/icons";

const tradingIcons: Record<string, React.FC<{ className?: string }>> = {
  "تعليم": TradingBasicsIcon,
  "أدوات": RiskShieldIcon,
  "مؤشرات": CryptoIcon,
  "شروحات": FreelancingIcon,
};

const tradingCategories = ["الكل", "تعليم", "أدوات", "مؤشرات", "شروحات"];

export function TradingSection() {
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const filteredItems = selectedCategory === "الكل"
    ? tradingData
    : tradingData.filter((item) => item.category === selectedCategory);

  return (
    <section className="section-gradient-trading py-8 md:py-16 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="section-title-3d mb-6">
            <span className="title-icon">
              <TrendingUp className="size-6" />
            </span>
            التداول
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            تعليم التداول، أدوات التحليل، مؤشرات، وشروحات مبسطة للمبتدئين والمحترفين
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex justify-center gap-2 flex-wrap">
          {tradingCategories.map((cat) => (
            <button
              key={cat}
              className={
                selectedCategory === cat
                  ? "btn-3d-sm shrink-0"
                  : "shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              }
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const ItemIcon = tradingIcons[item.category] || TradingBasicsIcon;
            return (
              <div key={item.id} className="card-3d flex flex-col p-6">
                <div className="icon-box mb-5 text-teal-500">
                  <ItemIcon className="size-7" />
                </div>
                <span className="mb-2 inline-block w-fit rounded-lg bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {item.category}
                </span>
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <a
                  href={`https://wa.me/967782138587?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن: ${item.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-3d-whatsapp w-full flex items-center justify-center gap-2 no-underline"
                >
                  تواصل للاستفسار
                  <ArrowLeft className="size-4" />
                </a>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-muted-foreground">لا توجد عناصر في هذا التصنيف</p>
          </div>
        )}
      </div>
    </section>
  );
}
