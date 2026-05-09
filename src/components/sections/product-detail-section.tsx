"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  ArrowRight,
  Loader2,
  Star,
} from "lucide-react";
import { useNavStore } from "@/store/nav-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { getProducts } from "@/lib/supabase-data";
import type { Product } from "@/lib/mock-data";
import { getCategoryIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ProductReviewsSection } from "@/components/sections/product-reviews-section";

export function ProductDetailSection() {
  const { selectedProductId, setCurrentPage, setSelectedProductId } = useNavStore();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!!selectedProductId);
  const [quantity, setQuantity] = useState(1);
  const [productRating, setProductRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedProductId) return;
    if (fetchedIdRef.current === selectedProductId) return;
    fetchedIdRef.current = selectedProductId;
    getProducts().then((products) => {
      const found = products.find((p) => p.id === selectedProductId) || null;
      setProduct(found);
      if (found) {
        addRecentlyViewed({
          id: found.id,
          name: found.name,
          price: found.price,
          salePrice: found.salePrice,
          category: found.category,
          image: found.images[0],
        });
      }
      setLoading(false);
    });

    // Fetch product rating
    fetch(`/api/reviews?product_id=${encodeURIComponent(selectedProductId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.averageRating !== undefined) {
          setProductRating({ avg: json.averageRating, count: json.totalCount });
        }
      })
      .catch(() => {});
  }, [selectedProductId, addRecentlyViewed]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images[0],
        category: product.category,
      });
    }
    toast.success(`تمت إضافة "${product.name}" إلى السلة 🛒`);
    openCart();
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0],
      category: product.category,
    });
    if (isInWishlist(product.id)) {
      toast.success("تمت إزالة المنتج من المفضلة");
    } else {
      toast.success("تمت إضافة المنتج إلى المفضلة ❤️");
    }
  };

  const handleGoBack = () => {
    setSelectedProductId(null);
    setCurrentPage("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="size-8 animate-spin text-gold-gradient" />
        <p className="text-muted-foreground">جارٍ تحميل المنتج...</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="section-title-3d">
          <span className="title-icon">
            <ShoppingCart className="size-6" />
          </span>
          المنتج غير موجود
        </div>
        <p className="text-muted-foreground">لم يتم العثور على المنتج المطلوب</p>
        <button
          className="btn-3d-sm flex items-center gap-2"
          onClick={handleGoBack}
        >
          <ArrowRight className="size-4" />
          العودة للمنتجات
        </button>
      </section>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const hasSale = product.salePrice && product.salePrice < product.price;
  const effectivePrice = hasSale ? product.salePrice : product.price;

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        <button
          className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all hover:bg-accent"
          onClick={handleGoBack}
        >
          <ArrowRight className="size-4" />
          العودة للمنتجات
        </button>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Image */}
          <div className="card-3d overflow-hidden">
            <div className="product-img-placeholder bg-muted !min-h-[320px] md:!min-h-[400px]">
              {getCategoryIcon(product.category, "size-20 text-muted-foreground/40")}
              {hasSale && (
                <Badge className="absolute top-4 right-4 z-10 bg-red-500 text-white hover:bg-red-500 shadow-lg text-sm px-3 py-1">
                  خصم{" "}
                  {Math.round(
                    ((product.price - product.salePrice) / product.price) * 100
                  )}
                  %
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Category badge */}
            <Badge className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-sm font-semibold text-gold-gradient border border-amber-500/20 px-3 py-1">
              {product.category}
            </Badge>

            {/* Name */}
            <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

            {/* Rating Badge */}
            {productRating.count > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < Math.round(productRating.avg)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-300 text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gold-gradient">
                  {productRating.avg}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({productRating.count})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              {hasSale ? (
                <>
                  <span className="text-3xl font-bold text-gold-gradient">
                    {product.salePrice} ر.ي
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {product.price} ر.ي
                  </span>
                  <Badge className="bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-0">
                    وفّر {(product.price - product.salePrice).toLocaleString("ar-SA")} ر.ي
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-gold-gradient">
                  {product.price} ر.ي
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <div
                className={`size-3 rounded-full ${
                  product.availability ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  product.availability
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {product.availability ? "متوفر في المخزون" : "غير متوفر حالياً"}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">الكمية:</span>
              <div className="flex items-center rounded-xl border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex size-10 items-center justify-center transition-colors hover:bg-accent"
                  aria-label="تقليل الكمية"
                >
                  <Minus className="size-4" />
                </button>
                <span className="flex min-w-[3rem] items-center justify-center text-base font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex size-10 items-center justify-center transition-colors hover:bg-accent"
                  aria-label="زيادة الكمية"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                المجموع:{" "}
                <span className="font-bold text-gold-gradient">
                  {(effectivePrice * quantity).toLocaleString("ar-SA")} ر.ي
                </span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                className="btn-3d flex flex-1 items-center justify-center gap-2 !py-4"
                onClick={handleAddToCart}
                disabled={!product.availability}
              >
                <ShoppingCart className="size-5" />
                أضف للسلة
              </button>
              <button
                className={`flex size-12 items-center justify-center rounded-xl border-2 transition-all ${
                  inWishlist
                    ? "border-red-300 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-950/30"
                    : "border-border bg-card text-muted-foreground hover:border-red-300 hover:text-red-500"
                }`}
                onClick={handleToggleWishlist}
                aria-label={inWishlist ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              >
                <Heart
                  className={`size-5 ${inWishlist ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {/* Seller info */}
            <div className="rounded-xl border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">البائع</p>
              <p className="text-sm font-semibold">{product.seller}</p>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <ProductReviewsSection productId={product.id} />
      </div>
    </section>
  );
}
