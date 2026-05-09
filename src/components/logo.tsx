"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className = "", compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 transition-opacity hover:opacity-80 ${className}`}
      aria-label="العودة إلى الصفحة الرئيسية"
    >
      {/* Gold diamond icon */}
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold-gradient text-[11px] font-black text-black md:size-8 md:text-xs">
        E
      </span>
      <span className="whitespace-nowrap text-sm font-black uppercase tracking-wide text-gold-gradient md:text-lg">
        Elite VIP Shop
      </span>
      {!compact && (
        <span className="hidden whitespace-nowrap text-xs text-muted-foreground sm:block md:text-sm">
          متجر النخبة
        </span>
      )}
    </Link>
  );
}
