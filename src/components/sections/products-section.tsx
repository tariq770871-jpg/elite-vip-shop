"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getProducts, getCategories } from "@/lib/supabase-data";
import { getWhatsAppOrderLink } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";
import { useNavigation } from "@/lib/navigation";
import { getCategoryIcon, ShoppingBagIcon } from "@/components/icons";

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['الكل']);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { navigateToProduct } = useNavigation();

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "الكل" || product.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        product.name.includes(searchQuery) ||
        product.description.includes(searchQuery) ||
        product.category.includes(searchQuery);
      return matchesCategory && matchesSearch && product.availability;
    });
  }, [products, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="section-gradient-products py-8 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="section-title-3d">
              <span className="title-icon"><ShoppingBagIcon className="size-6" /></span>
              متجر منتجات النخبة
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="size-8 animate-spin text-gold-gradient" />
            <p className="text-muted-foreground">جارٍ تحميل المنتجات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-gradient-products py-8 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 md:mb-10">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="section-title-3d">
              <span className="title-icon"><ShoppingBagIcon className="size-6" /></span>
              متجر منتجات النخبة
            </div>
          </div>
          <p className="text-center text-muted-foreground mb-6 max-w-xl mx-auto">
            اكتشف أحدث المنتجات المميزة — اطلب عبر واتساب مباشرة
          </p>

          <div className="relative mb-6">
            <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ابحث عن منتج..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="ps-10 pe-10 rounded-xl" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">مسح</button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? "btn-3d-sm shrink-0" : "shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">عرض {filteredProducts.length} منتج</p>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card-3d group overflow-hidden">
                <div className="product-img-placeholder relative bg-muted cursor-pointer" onClick={() => navigateToProduct(product.id)}>
                  {product.images[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" loading="lazy" />
                  ) : (
                    getCategoryIcon(product.category, "size-14 text-muted-foreground/40")
                  )}
                  {product.salePrice && (
                    <Badge className="absolute top-3 right-3 z-10 bg-red-500 text-white hover:bg-red-500 shadow-lg">
                      خصم {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                    </Badge>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/10">
                    <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm">عرض التفاصيل</span>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <Badge className="mb-2 cursor-pointer bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-xs font-semibold text-gold-gradient border border-amber-500/20 transition-all hover:border-amber-500/50 hover:scale-105" onClick={() => setSelectedCategory(product.category === selectedCategory ? "الكل" : product.category)}>
                    {product.category}
                  </Badge>
                  <h3 className="mb-2 line-clamp-1 text-lg font-bold">{product.name}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                  <div className="mb-4 flex items-center gap-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-gold-gradient">{product.salePrice} ر.ي</span>
                        <span className="text-sm text-muted-foreground line-through">{product.price} ر.ي</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gold-gradient">{product.price} ر.ي</span>
                    )}
                  </div>
                  <a href={getWhatsAppOrderLink(product.name)} target="_blank" rel="noopener noreferrer" className="btn-3d-whatsapp w-full flex items-center justify-center gap-2 text-sm no-underline !rounded-xl !py-3">
                    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    اطلب عبر واتساب
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">لا توجد منتجات في هذا التصنيف</h3>
            <button className="btn-3d-sm mt-2" onClick={() => { setSelectedCategory("الكل"); setSearchQuery(""); }}>
              عرض جميع المنتجات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
