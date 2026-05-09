"use client";

import { useState, useEffect, useMemo } from "react";
import { ShoppingBag, ShoppingCart, Flame, Clock, Heart, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/supabase-data";
import type { Product } from "@/lib/mock-data";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { useNavigation } from "@/lib/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor(distance / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function CountdownTimer({ hours, minutes, seconds }: { hours: number; minutes: number; seconds: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <Clock className="size-4 text-red-500" />
      {[
        { value: hours, label: "س" },
        { value: minutes, label: "د" },
        { value: seconds, label: "ث" },
      ].map((unit, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="flex size-9 items-center justify-center rounded-lg bg-red-500 text-sm font-black text-white shadow-md">
            {String(unit.value).padStart(2, "0")}
          </div>
          <span className="text-[10px] font-bold text-red-400">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

export function FlashDealsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);
  const { navigateTo } = useNavigation();

  // Set deal end time to midnight today + remaining hours (or tomorrow if past midnight)
  const dealEndTime = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    if (end.getTime() - now.getTime() < 3600000) {
      // Less than 1 hour left, extend to tomorrow
      end.setDate(end.getDate() + 1);
    }
    return end;
  }, []);

  const timeLeft = useCountdown(dealEndTime);

  useEffect(() => {
    getProducts().then((prods) => {
      // Filter products with sale prices for flash deals
      const deals = prods.filter((p) => p.salePrice && p.salePrice < p.price && p.availability);
      setProducts(deals);
      setLoading(false);
    });
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0],
      category: product.category,
    });
    openCart();
  };

  if (loading) {
    return (
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="size-8 animate-spin text-gold-gradient" />
            <p className="text-muted-foreground">جارٍ تحميل العروض...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <>
      <section className="relative overflow-hidden py-8 md:py-12">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-bl from-red-500/5 via-transparent to-orange-500/5" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="icon-box" style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))", borderColor: "rgba(239, 68, 68, 0.2)" }}>
                <Flame className="size-7 text-red-500" />
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold md:text-2xl">عروض سريعة</h2>
                <p className="text-sm text-muted-foreground">خصومات حصرية تنتهي قريباً</p>
              </div>
            </div>
            <CountdownTimer {...timeLeft} />
          </div>

          {/* Deals Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const discount = Math.round(((product.price - (product.salePrice || product.price)) / product.price) * 100);
              const wishlisted = isInWishlist(product.id);

              return (
                <div key={product.id} className="card-3d group overflow-hidden">
                  {/* Image */}
                  <div
                    className="product-img-placeholder relative cursor-pointer bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20"
                    onClick={() => {
                      setSelectedProduct(product);
                      addRecentlyViewed({ id: product.id, name: product.name, price: product.price, salePrice: product.salePrice, category: product.category, image: product.images[0] });
                    }}
                  >
                    <ShoppingBag className="size-14 text-red-300/40" />
                    {/* Discount badge */}
                    <Badge className="absolute top-3 right-3 z-10 bg-red-500 text-white hover:bg-red-500 shadow-lg text-sm px-2.5 py-0.5">
                      -{discount}%
                    </Badge>
                    {/* Wishlist button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItem({ id: product.id, name: product.name, price: product.price, salePrice: product.salePrice, image: product.images[0], category: product.category });
                      }}
                      className={`absolute top-3 left-3 z-10 flex size-8 items-center justify-center rounded-full transition-all hover:scale-110 ${
                        wishlisted ? "bg-red-500 text-white" : "bg-white/80 text-gray-500 dark:bg-gray-800/80"
                      }`}
                    >
                      <Heart className={`size-4 ${wishlisted ? "fill-current" : ""}`} />
                    </button>
                    {/* Click overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/5 active:bg-black/10">
                      <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm">عرض سريع</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <Badge className="mb-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 text-xs font-semibold text-red-500 border border-red-500/20">
                      عرض سريع
                    </Badge>
                    <h3 className="mb-2 line-clamp-1 text-sm font-bold">{product.name}</h3>
                    <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-lg font-extrabold text-red-500">{product.salePrice} ر.ي</span>
                      <span className="text-xs text-muted-foreground line-through">{product.price} ر.ي</span>
                    </div>
                    <button
                      className="btn-3d-sm w-full flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #ef4444, #f97316)", boxShadow: "0 3px 0 #dc2626, 0 6px 0 #b91c1c, 0 8px 16px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255,255,255,0.3)" }}
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="size-4" />
                      أضف للسلة
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All */}
          <div className="mt-8 flex justify-center">
            <button
              className="btn-3d-sm flex items-center gap-2"
              onClick={() => navigateTo("products")}
            >
              <ShoppingBag className="size-4" />
              عرض جميع المنتجات
            </button>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Product image */}
                <div className="flex h-48 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <ShoppingBag className="size-16 text-amber-300/40" />
                </div>
                {/* Category */}
                <Badge className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-xs font-semibold text-gold-gradient border border-amber-500/20">
                  {selectedProduct.category}
                </Badge>
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                {/* Price */}
                <div className="flex items-center gap-3">
                  {selectedProduct.salePrice ? (
                    <>
                      <span className="text-2xl font-extrabold text-gold-gradient">{selectedProduct.salePrice} ر.ي</span>
                      <span className="text-sm text-muted-foreground line-through">{selectedProduct.price} ر.ي</span>
                      <Badge className="bg-red-500 text-white hover:bg-red-500">
                        خصم {Math.round(((selectedProduct.price - selectedProduct.salePrice) / selectedProduct.price) * 100)}%
                      </Badge>
                    </>
                  ) : (
                    <span className="text-2xl font-extrabold text-gold-gradient">{selectedProduct.price} ر.ي</span>
                  )}
                </div>
                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    className="btn-3d-sm flex-1 flex items-center justify-center gap-2"
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                  >
                    <ShoppingCart className="size-4" />
                    أضف للسلة
                  </button>
                  <button
                    className={`flex size-11 items-center justify-center rounded-xl border transition-all hover:scale-105 ${
                      isInWishlist(selectedProduct.id) ? "bg-red-500 text-white border-red-500" : "border-border text-muted-foreground hover:text-red-500"
                    }`}
                    onClick={() => toggleItem({ id: selectedProduct.id, name: selectedProduct.name, price: selectedProduct.price, salePrice: selectedProduct.salePrice, image: selectedProduct.images[0], category: selectedProduct.category })}
                  >
                    <Heart className={`size-5 ${isInWishlist(selectedProduct.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
