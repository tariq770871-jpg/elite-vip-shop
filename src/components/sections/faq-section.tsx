"use client";

import { useState, useMemo } from "react";
import { HelpCircle, Search, MessageCircle } from "lucide-react";
import { faqData } from "@/lib/mock-data";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { WHATSAPP_LINK } from "@/lib/site-config";

const faqCategories = [
  { id: "الكل", label: "الكل", icon: "📋" },
  { id: "عام", label: "عام", icon: "💡" },
  { id: "طلب", label: "الطلبات", icon: "🛒" },
  { id: "دفع", label: "الدفع", icon: "💳" },
  { id: "شحن", label: "الشحن", icon: "🚚" },
  { id: "خدمات", label: "الخدمات", icon: "⚙️" },
];

export function FaqSection() {
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    let items = faqData;

    // Filter by category
    if (selectedCategory !== "الكل") {
      items = items.filter((item) => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }

    return items;
  }, [selectedCategory, searchQuery]);

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

        {/* Search Bar */}
        <div className="mx-auto mb-6 max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث في الأسئلة الشائعة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-3 pe-11 ps-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Visual Category Tabs */}
        <div className="mb-8 flex justify-center gap-2 flex-wrap">
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? "btn-3d-sm !gap-1.5"
                  : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion with smooth animations */}
        {filteredItems.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-3">
            {filteredItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="card-3d !rounded-2xl border-0 px-1"
              >
                <AccordionTrigger className="flex items-center gap-3 p-5 text-right hover:no-underline [&>svg]:hidden">
                  <div className="flex items-center gap-3 text-right">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold data-[state=open]:bg-primary data-[state=open]:text-primary-foreground">
                      ?
                    </span>
                    <span className="text-base font-bold">{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-sm leading-relaxed text-muted-foreground pe-11">
                      {item.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <Search className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "لا توجد نتائج مطابقة لبحثك"
                : "لا توجد أسئلة في هذا التصنيف"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm font-medium text-primary hover:underline"
              >
                مسح البحث
              </button>
            )}
          </div>
        )}

        {/* Contact CTA - Didn't find answer */}
        <div className="mt-10">
          <div className="card-3d p-6 text-center md:p-8">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-green-500/10">
              <MessageCircle className="size-7 text-green-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold">
              لم تجد إجابة؟ تواصل معنا
            </h3>
            <p className="mb-5 text-sm text-muted-foreground">
              فريقنا جاهز للإجابة على جميع استفساراتك عبر واتساب في أقرب وقت
            </p>
            <a
              href={`${WHATSAPP_LINK}?text=${encodeURIComponent("مرحباً، لدي سؤال حول")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-whatsapp inline-flex items-center justify-center gap-2 no-underline"
            >
              <WhatsAppIcon size={20} className="size-5" />
              تواصل عبر واتساب
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
