"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Loader2,
  Star,
  ShoppingCart,
} from "lucide-react";
import { useNavigation } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { getProductById } from "@/lib/supabase-data";
import { getWhatsAppOrderLink } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";
import { getCategoryIcon } from "@/components/icons";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { Badge } from "@/components/ui/badge";
import { ProductReviewsSection } from "@/components/sections/product-reviews-section";
import { OrderModal } from "@/components/order-modal";

interface ProductDetailSectionProps {
  productId?: string;
}

export function ProductDetailSection({ productId: productIdProp }: ProductDetailSectionProps) {
  const { productId: navProductId, navigateTo } = useNavigation();
  const effectiveProductId = productIdProp || navProductId;
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!!effectiveProductId);
  const [productRating, setProductRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [pendingOrderAfterLogin, setPendingOrderAfterLogin] = useState(false);
  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!effectiveProductId) return;
    if (fetchedIdRef.current === effectiveProductId) return;
    fetchedIdRef.current = effectiveProductId;
    // ── Fetch single product by ID (not ALL products) ──
    // Previously this called getProducts() which fetched the entire table,
    // then used .find() to pick one — wasting bandwidth and adding latency.
    getProductById(effectiveProductId).then((found) => {
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
    }).catch((err) => {
      // Critical — without the product the page can't render; show fallback
      console.error("Failed to load product:", err instanceof Error ? err.message : String(err));
      setProduct(null);
      setLoading(false);
    });

    fetch(`/api/reviews?product_id=${encodeURIComponent(effectiveProductId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.averageRating !== undefined) {
          setProductRating({ avg: json.averageRating, count: json.totalCount });
        }
      })
      .catch((err) => {
        // Non-critical — reviews are optional; log for monitoring
        console.warn("Failed to load product reviews:", err instanceof Error ? err.message : String(err));
      });
  }, [effectiveProductId, addRecentlyViewed]);

  const handleGoBack = () => {
    navigateTo("products");
  };

  // Auto-open order modal after login if user was trying to order
  useEffect(() => {
    if (!isAuthenticated || !pendingOrderAfterLogin || !product) return;
    const frame = window.requestAnimationFrame(() => {
      setPendingOrderAfterLogin(false);
      setOrderModalOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isAuthenticated, pendingOrderAfterLogin, product]);

  const handleOrderClick = () => {
    if (!isAuthenticated) {
      // Save the intent and navigate to login
      setPendingOrderAfterLogin(true);
    }
    setOrderModalOpen(true);
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
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </span>
          المنتج غير موجود
        </div>
        <p className="text-muted-foreground">لم يتم العثور على المنتج المطلوب</p>
        <button className="btn-3d-sm flex items-center gap-2" onClick={handleGoBack}>
          <ArrowRight className="size-4" />
          العودة للمنتجات
        </button>
      </section>
    );
  }

  const hasSale = product.salePrice && product.salePrice < product.price;

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <button className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all hover:bg-accent" onClick={handleGoBack}>
          <ArrowRight className="size-4" />
          العودة للمنتجات
        </button>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="card-3d overflow-hidden">
            <div className="product-img-placeholder relative bg-muted !min-h-[320px] md:!min-h-[400px]">
              {product.images[0] ? (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" />
              ) : (
                getCategoryIcon(product.category, "size-20 text-muted-foreground/40")
              )}
              {hasSale && (
                <Badge className="absolute top-4 right-4 z-10 bg-red-500 text-white hover:bg-red-500 shadow-lg text-sm px-3 py-1">
                  خصم {Math.round(((product.price - (product.salePrice ?? product.price)) / product.price) * 100)}%
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <Badge className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-sm font-semibold text-gold-gradient border border-amber-500/20 px-3 py-1">
              {product.category}
            </Badge>
            <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

            {productRating.count > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-4 ${i < Math.round(productRating.avg) ? "fill-amber-400 text-amber-400" : "fill-gray-300 text-gray-300"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gold-gradient">{productRating.avg}</span>
                <span className="text-xs text-muted-foreground">({productRating.count})</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {hasSale ? (
                <>
                  <span className="text-3xl font-bold text-gold-gradient">{product.salePrice} ر.ي</span>
                  <span className="text-lg text-muted-foreground line-through">{product.price} ر.ي</span>
                  <Badge className="bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-0">
                    وفّر {(product.price - (product.salePrice ?? product.price)).toLocaleString("ar-SA")} ر.ي
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-gold-gradient">{product.price} ر.ي</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2">
              <div className={`size-3 rounded-full ${product.availability ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`text-sm font-medium ${product.availability ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {product.availability ? "متوفر في المخزون" : "غير متوفر حالياً"}
              </span>
            </div>

            {product.availability ? (
              <div className="flex items-center gap-3">
                {/* Golden Order Button - PRIMARY */}
                <button
                  onClick={handleOrderClick}
                  className="flex-1 flex items-center justify-center gap-3 text-base !py-4 rounded-xl
                    bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold
                    shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-yellow-500
                    transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="size-5" />
                  اطلب الآن
                </button>

                {/* Inquiry Button - SECONDARY */}
                <a
                  href={getWhatsAppOrderLink(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-4 text-sm font-medium transition-all hover:bg-accent no-underline"
                >
                  <WhatsAppIcon size={18} className="size-4" />
                  استعلام
                </a>
              </div>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-3 text-base !py-4 rounded-xl opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                aria-disabled="true"
              >
                غير متوفر حالياً
              </button>
            )}

            <div className="rounded-xl border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">البائع</p>
              <p className="text-sm font-semibold">{product.seller}</p>
            </div>
          </div>
        </div>

        <ProductReviewsSection productId={product.id} />
      </div>

      {/* Order Modal */}
      <OrderModal
        open={orderModalOpen}
        onOpenChange={setOrderModalOpen}
        product={
          product
            ? {
                id: product.id,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice,
                image: product.images[0],
                category: product.category,
                availability: product.availability,
              }
            : null
        }
      />
    </section>
  );
}
