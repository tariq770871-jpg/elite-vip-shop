"use client";

import { ShoppingBag, Eye, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { useCartStore } from "@/store/cart-store";
import { getCategoryIcon } from "@/components/icons";

export function RecentlyViewedSection() {
  const { items, clearAll } = useRecentlyViewedStore();
  const addItem = useCartStore((s) => s.addItem);

  if (items.length === 0) return null;

  return (
    <section className="border-y bg-muted/30 py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="size-5 text-muted-foreground" />
            <h3 className="text-sm font-bold">شوهدت مؤخراً</h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {items.length}
            </span>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="size-3" />
            مسح الكل
          </button>
        </div>

        {/* Horizontal scroll of recently viewed */}
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
          {items.slice(0, 8).map((item) => (
            <div
              key={`${item.id}-${item.viewedAt}`}
              className="card-3d group flex min-w-[160px] max-w-[180px] shrink-0 flex-col p-3 cursor-pointer"
            >
              <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-muted">
                {getCategoryIcon(item.category, "size-8 text-muted-foreground/40")}
              </div>
              <Badge className="mb-1.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-[10px] font-semibold text-gold-gradient border border-amber-500/20 w-fit">
                {item.category}
              </Badge>
              <h4 className="mb-2 line-clamp-1 text-xs font-bold">{item.name}</h4>
              <div className="flex items-center gap-1.5">
                {item.salePrice ? (
                  <>
                    <span className="text-sm font-bold text-gold-gradient">{item.salePrice}</span>
                    <span className="text-[10px] text-muted-foreground line-through">{item.price}</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-gold-gradient">{item.price}</span>
                )}
                <span className="text-[10px] text-muted-foreground">ر.ي</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
