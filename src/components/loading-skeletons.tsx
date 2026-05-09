import { cn } from "@/lib/utils";

/**
 * Skeleton pulse animation — a single shimmer bar.
 */
function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

/**
 * Skeleton matching the visual structure of a product card.
 * Includes: image placeholder, category badge, title, description, price, and CTA.
 */
export function ProductCardSkeleton() {
  return (
    <div className="card-3d overflow-hidden">
      {/* Image placeholder */}
      <div className="product-img-placeholder relative bg-muted">
        <SkeletonBar className="absolute inset-0 rounded-none" />
      </div>
      <div className="p-4 sm:p-5 space-y-3">
        {/* Category badge */}
        <SkeletonBar className="h-5 w-20 rounded-full" />
        {/* Title */}
        <SkeletonBar className="h-5 w-3/4" />
        {/* Description (2 lines) */}
        <div className="space-y-1.5">
          <SkeletonBar className="h-3.5 w-full" />
          <SkeletonBar className="h-3.5 w-2/3" />
        </div>
        {/* Price */}
        <SkeletonBar className="h-6 w-24" />
        {/* CTA Button */}
        <SkeletonBar className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Grid of product card skeletons (6–8 items).
 * Use this while the product list is loading.
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Generic section skeleton with a title, subtitle, and content area.
 */
export function SectionSkeleton({
  className,
  showTitle = true,
  showSubtitle = true,
  contentHeight = "h-64",
}: {
  className?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  contentHeight?: string;
}) {
  return (
    <div className={cn("py-8 md:py-16", className)}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Section title */}
        {showTitle && (
          <div className="flex justify-center mb-6 sm:mb-8">
            <SkeletonBar className="h-10 w-56 rounded-2xl" />
          </div>
        )}
        {/* Subtitle */}
        {showSubtitle && (
          <div className="flex justify-center mb-6">
            <SkeletonBar className="h-4 w-72" />
          </div>
        )}
        {/* Content area */}
        <SkeletonBar className={cn("w-full rounded-2xl", contentHeight)} />
      </div>
    </div>
  );
}
