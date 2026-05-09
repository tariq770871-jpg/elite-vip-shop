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

            <a
              href={getWhatsAppOrderLink(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-whatsapp flex items-center justify-center gap-3 text-base no-underline !py-4"
              disabled={!product.availability}
            >
              <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              اطلب عبر واتساب
            </a>

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
