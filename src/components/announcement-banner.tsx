import Link from "next/link";
import { Megaphone, Truck } from "lucide-react";

/**
 * Server-rendered announcement strip.
 * Keeping the first promotional message in the initial HTML avoids turning the
 * site-wide banner into a client hydration bottleneck and keeps it crawlable.
 */
export function AnnouncementBanner() {
  return (
    <div
      className="relative overflow-hidden bg-gradient-to-l from-amber-600 via-amber-500 to-amber-600 text-black"
      role="region"
      aria-label="الإعلانات والعروض"
    >
      <div className="mx-auto flex min-h-9 items-center justify-center gap-2 px-10 py-1">
        <Megaphone className="hidden size-4 shrink-0 sm:block" aria-hidden="true" />
        <Link
          href="/shipping-policy"
          className="flex items-center gap-2 text-center text-xs font-bold leading-5 transition-opacity hover:opacity-80 sm:text-sm"
        >
          <Truck className="size-4 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">شحن مجاني لجميع الطلبات فوق 5,000 ر.ي</span>
        </Link>
      </div>
    </div>
  );
}
