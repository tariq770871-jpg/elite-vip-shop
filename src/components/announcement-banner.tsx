"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Truck, Zap, Gift, Megaphone } from "lucide-react";
import { useNavigation } from "@/lib/navigation";
import type { PageName } from "@/lib/navigation";

const announcements = [
  {
    id: 1,
    text: "شحن مجاني لجميع الطلبات فوق 5,000 ر.ي",
    icon: <Truck className="size-4 shrink-0" />,
    link: "shipping-policy",
  },
  {
    id: 2,
    text: "عروض سريعة! خصومات تصل إلى 50% على الإلكترونيات",
    icon: <Zap className="size-4 shrink-0" />,
    link: "products",
  },
  {
    id: 3,
    text: "اشترك في نشرتنا واحصل على خصم 10% على أول طلب",
    icon: <Gift className="size-4 shrink-0" />,
    link: "home",
  },
];

export function AnnouncementBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem("announcement-dismissed");
    }
    return true;
  });
  const { navigateTo } = useNavigation();

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(goNext, 4000);
    return () => clearInterval(interval);
  }, [goNext]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("announcement-dismissed", "true");
  };

  const handleClick = (link: string) => {
    navigateTo(link as PageName);
  };

  if (!isVisible) return null;

  const announcement = announcements[currentIndex];

  return (
    <div className="relative overflow-hidden bg-gradient-to-l from-amber-600 via-amber-500 to-amber-600 text-black">
      <div className="mx-auto flex h-9 items-center justify-center gap-2 px-10">
        <Megaphone className="hidden size-4 sm:block" />
        <button
          onClick={() => handleClick(announcement.link)}
          className="flex items-center gap-2 text-center text-sm font-bold transition-opacity hover:opacity-80"
        >
          {announcement.icon}
          <span className="animate-marquee">{announcement.text}</span>
        </button>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-opacity hover:opacity-70"
        aria-label="إغلاق"
      >
        <X className="size-4" />
      </button>
      {/* Progress dots */}
      <div className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-1">
        {announcements.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 w-3 rounded-full transition-all ${
              i === currentIndex ? "bg-black" : "bg-black/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
