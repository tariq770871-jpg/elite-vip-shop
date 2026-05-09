"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Loader2,
  Star,
} from "lucide-react";
import { useNavigation } from "@/lib/navigation";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { getProducts } from "@/lib/supabase-data";
import { getWhatsAppOrderLink } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";
import { getCategoryIcon } from "@/components/icons";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { Badge } from "@/components/ui/badge";
import { ProductReviewsSection } from "@/components/sections/product-reviews-section";

interface ProductDetailSectionProps {
  productId?: string;
}

export function ProductDetailSection({ productId: productIdProp }: ProductDetailSectionProps) {
  const { productId: navProductId, navigateTo } = useNavigation();
  const effectiveProductId = productIdProp || navProductId;
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!!effectiveProductId);
  const [productRating, setProductRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!effectiveProductId) return;
    if (fetchedIdRef.current === effectiveProductId) return;
    fetchedIdRef.current = effectiveProductId;
    getProducts().then((products) => {
      const found = products.find((p) => p.id === effectiveProductId) || null;
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

    fetch(`/api/reviews?product_id=${encodeURIComponent(effectiveProductId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.averageRating !== undefined) {
          setProductRating({ avg: json.averageRating, count: json.totalCount });
        }
      })
      .catch(() => {});
  }, [effectiveProductId, addRecentlyViewed]);

  const handleGoBack = () => {
    navigateTo("products");
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
                  خصم {Math.round(((product.price - product.salePrice!) / product.price) * 100)}%
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
                    وفّر {(product.price - product.salePrice!).toLocaleString("ar-SA")} ر.ي
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
              <a
                href={getWhatsAppOrderLink(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d-whatsapp flex items-center justify-center gap-3 text-base no-underline !py-4"
              >
                <WhatsAppIcon size={24} className="size-6" />
                اطلب عبر واتساب
              </a>
            ) : (
              <button
                disabled
                className="btn-3d-whatsapp flex items-center justify-center gap-3 text-base !py-4 opacity-50 cursor-not-allowed"
                aria-disabled="true"
              >
                <WhatsAppIcon size={24} className="size-6" />
                اطلب عبر واتساب
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
    </section>
  );
}
