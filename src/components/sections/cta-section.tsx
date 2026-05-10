"use client";

import { ArrowLeft } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  whatsappMessage?: string;
}

export function CTASection({
  title = "هل أنت مستعد لتجربة استثنائية؟",
  description = "تواصل معنا الآن عبر واتساب واحصل على أفضل المنتجات والخدمات بأسعار حصرية",
  buttonText = "تواصل معنا الآن",
  whatsappMessage = "مرحباً، أريد الاستفسار عن خدماتكم ومنتجاتكم",
}: CTASectionProps) {
  const whatsappUrl = `https://wa.me/967782138587?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative overflow-hidden py-12 md:py-16 px-4 md:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-l from-[#d4a843] via-[#f0d078] to-[#d4a843]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.05),transparent_60%)]" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 h-32 w-32">
        <div className="absolute top-4 left-4 h-full w-full rounded-full bg-white/10 blur-2xl" />
      </div>
      <div className="absolute bottom-0 right-0 h-32 w-32">
        <div className="absolute bottom-4 right-4 h-full w-full rounded-full bg-black/5 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="mb-4 text-2xl font-black text-black md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-sm text-black/70 md:text-lg">
          {description}
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-2xl bg-black px-8 py-4 text-base font-extrabold text-gold-gradient shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 no-underline md:px-12 md:py-5 md:text-lg"
          style={{
            background: "linear-gradient(135deg, #0a0a0a, #1a1a1a)",
            color: "#f0d078",
          }}
        >
          <WhatsAppIcon size={24} className="size-6" />
          {buttonText}
          <ArrowLeft className="size-5" />
        </a>
      </div>
    </section>
  );
}
