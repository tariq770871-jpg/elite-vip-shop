"use client";

import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { useNavStore } from "@/store/nav-store";
import { getCategoryIcon } from "@/components/icons";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function WishlistSection() {
  const { items, removeItem, toggleItem, isInWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { setCurrentPage, setSelectedProductId } = useNavStore();

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      salePrice: item.salePrice,
      image: item.image,
      category: item.category,
    });
    openCart();
    toast.success(`تمت إضافة "${item.name}" إلى السلة`);
  };

  const handleRemoveFromWishlist = (id: string, name: string) => {
    removeItem(id);
    toast.success(`تمت إزالة "${name}" من المفضلة`);
  };

  const handleToggleWishlist = (item: typeof items[0]) => {
    toggleItem({
      id: item.id,
      name: item.name,
      price: item.price,
      salePrice: item.salePrice,
      image: item.image,
      category: item.category,
    });
  };

  if (items.length === 0) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="flex size-24 items-center justify-center rounded-full bg-muted">
          <Heart className="size-10 text-muted-foreground" />
        </div>
        <div className="section-title-3d">
          <span className="title-icon">
            <Heart className="size-6" />
          </span>
          المفضلة
        </div>
        <p className="text-muted-foreground text-center max-w-sm">
          لم تقم بإضافة أي منتجات إلى المفضلة بعد
        </p>
        <button
          className="btn-3d-sm flex items-center gap-2"
          onClick={() => setCurrentPage("products")}
        >
          <ShoppingCart className="size-4" />
          تصفح المنتجات
        </button>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-center mb-8">
            <div className="section-title-3d">
              <span className="title-icon">
                <Heart className="size-6" />
              </span>
              المفضلة
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {items.length} منتج في المفضلة
          </p>
        </div>

        {/* Wishlist Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="card-3d group overflow-hidden">
              {/* Image placeholder */}
              <div
                className="product-img-placeholder relative bg-muted cursor-pointer"
                onClick={() => {
                  setSelectedProductId(item.id);
                  setCurrentPage("product-detail");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {getCategoryIcon(item.category, "size-14 text-muted-foreground/40")}
                {item.salePrice && (
                  <Badge className="absolute top-3 right-3 z-10 bg-red-500 text-white hover:bg-red-500 shadow-lg">
                    خصم{" "}
                    {Math.round(
                      ((item.price - item.salePrice) / item.price) * 100
                    )}
                    %
                  </Badge>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/10 active:bg-black/20">
                  <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                    عرض التفاصيل
                  </span>
                </div>
              </div>
              {/* Content */}
              <div className="p-5">
                <Badge className="mb-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-xs font-semibold text-gold-gradient border border-amber-500/20">
                  {item.category}
                </Badge>
                <h3 className="mb-2 line-clamp-1 text-lg font-bold">
                  {item.name}
                </h3>
                <div className="mb-4 flex items-center gap-2">
                  {item.salePrice ? (
                    <>
                      <span className="text-lg font-bold text-gold-gradient">
                        {item.salePrice} ر.ي
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {item.price} ر.ي
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gold-gradient">
                      {item.price} ر.ي
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-3d-sm flex flex-1 items-center justify-center gap-2"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="size-4" />
                    أضف للسلة
                  </button>
                  <button
                    className="flex size-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                    onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                    aria-label="إزالة من المفضلة"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to products */}
        <div className="mt-8 flex justify-center">
          <button
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:bg-accent"
            onClick={() => setCurrentPage("products")}
          >
            <ArrowRight className="size-4" />
            العودة للمنتجات
          </button>
        </div>
      </div>
    </section>
  );
}
