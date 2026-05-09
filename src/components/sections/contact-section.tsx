"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  WhatsAppBrandIcon,
  TelegramBrandIcon,
  EmailBrandIcon,
  FacebookBrandIcon,
  SpeechBubbleIcon,
} from "@/components/icons";

const contactCards = [
  {
    icon: <WhatsAppBrandIcon className="size-6" />,
    label: "واتساب",
    value: "967782138587",
    href: "https://wa.me/967782138587",
    color: "text-green-500",
    borderColor: "border-green-500/20",
    iconBg: "bg-green-500/10",
  },
  {
    icon: <TelegramBrandIcon className="size-6" />,
    label: "تيليجرام",
    value: "@tariq77087",
    href: "https://t.me/tariq77087",
    color: "text-sky-500",
    borderColor: "border-sky-500/20",
    iconBg: "bg-sky-500/10",
  },
  {
    icon: <EmailBrandIcon className="size-6" />,
    label: "البريد الإلكتروني",
    value: "tariq770871@gmail.com",
    href: "mailto:tariq770871@gmail.com",
    color: "text-red-500",
    borderColor: "border-red-500/20",
    iconBg: "bg-red-500/10",
  },
  {
    icon: <FacebookBrandIcon className="size-6" />,
    label: "فيسبوك",
    value: "صفحتنا على فيسبوك",
    href: "https://facebook.com/share/1Gr8vRUE4M/",
    color: "text-blue-600",
    borderColor: "border-blue-600/20",
    iconBg: "bg-blue-600/10",
  },
];

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      toast.error("يرجى ملء الاسم والرسالة");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject: subject || "رسالة عامة", message }),
      });

      if (res.ok) {
        setIsSent(true);
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
        toast.success("تم إرسال رسالتك بنجاح!");
        setTimeout(() => setIsSent(false), 5000);
      } else {
        toast.error("حدث خطأ في إرسال الرسالة");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="section-title-3d mb-4 inline-flex">
            <span className="title-icon">
              <SpeechBubbleIcon className="size-6" />
            </span>
            اتصل بنا
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            نحن هنا لمساعدتك! تواصل معنا عبر أي من القنوات التالية
          </p>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gold-gradient" />
        </div>

        {/* Contact Cards */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card-3d flex flex-col items-center p-6 text-center"
            >
              <div className={`mb-3 flex size-14 items-center justify-center rounded-2xl ${card.iconBg}`}>
                {card.icon}
              </div>
              <h3 className="mb-1 font-semibold">{card.label}</h3>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {card.value}
              </p>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="mx-auto max-w-2xl">
          <div className="card-3d p-6 md:p-8">
            <h2 className="mb-6 text-xl font-bold">أرسل لنا رسالة</h2>
            {isSent ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-green-500/10">
                  <svg className="size-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="text-lg font-semibold">تم إرسال رسالتك بنجاح!</p>
                <p className="text-sm text-muted-foreground">
                  سنقوم بالرد عليك في أقرب وقت ممكن
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">الاسم <span className="text-destructive">*</span></Label>
                    <Input
                      id="contact-name"
                      type="text"
                      placeholder="أدخل اسمك"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">البريد الإلكتروني</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">رقم الهاتف</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="+967 XXX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">الموضوع</Label>
                    <Input
                      id="contact-subject"
                      type="text"
                      placeholder="موضوع الرسالة"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">الرسالة <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="contact-message"
                    placeholder="اكتب رسالتك هنا..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-3d w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
