"use client";

import { useEffect, useRef, useState } from "react";

interface DeferredSectionProps {
  children: React.ReactNode;
  /** Reserve enough space to avoid layout shifts before the section mounts. */
  minHeight?: number;
  /** Start loading before the section enters the viewport. */
  rootMargin?: string;
  className?: string;
}

/**
 * Mounts below-the-fold interactive sections only when they approach the viewport.
 * This keeps initial JavaScript, timers, subscriptions, and data requests off the
 * critical path while preserving a smooth scroll experience.
 */
export function DeferredSection({
  children,
  minHeight = 160,
  rootMargin = "700px 0px",
  className,
}: DeferredSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      const fallbackTimer = globalThis.setTimeout(() => setShouldRender(true), 0);
      return () => globalThis.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={containerRef} className={className} style={shouldRender ? undefined : { minHeight }}>
      {shouldRender ? children : null}
    </div>
  );
}
