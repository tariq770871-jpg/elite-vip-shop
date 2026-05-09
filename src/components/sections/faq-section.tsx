"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { faqData } from "@/lib/mock-data";

const faqCategories = ["الكل", "عام", "طلب", "دفع", "شحن", "خدمات"];

export function FaqSection() {
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredItems = selectedCategory === "الكل"
    ? faqData
    : faqData.filter((item) => item.category === selectedCategory);

  return (
    <section className="section-gradient-faq py-8 md:py-16 px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="section-title-3d mb-6">
            <span className="title-icon">
              <HelpCircle className="size-6" />
            </span>
            الأسئلة الشائعة
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            إجابات على أكثر الأسئلة شيوعاً حول الموقع والطلبات والدفع والشحن
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex justify-center gap-2 flex-wrap">
          {faqCategories.map((cat) => (
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

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="card-3d overflow-hidden !rounded-2xl"
              >
                <button
                  className="flex w-full items-center justify-between p-5 text-right"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                      {isOpen ? "−" : "?"}
                    </span>
                    <span className="text-base font-bold">{item.question}</span>
                  </div>
                  <ChevronDown
                    className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border/50 px-5 pb-5 pt-4">
                    <p className="text-sm leading-relaxed text-muted-foreground pe-11">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-muted-foreground">لا توجد أسئلة في هذا التصنيف</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-10 text-center">
          <p className="mb-4 text-sm text-muted-foreground">لم تجد إجابتك؟ تواصل معنا مباشرة</p>
          <a
            href="https://wa.me/967782138587"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-3d-whatsapp inline-flex items-center justify-center gap-2 no-underline"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            تواصل عبر واتساب
          </a>
        </div>
      </div>
    </section>
  );
}
