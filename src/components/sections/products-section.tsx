"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProducts, getCategories } from "@/lib/supabase-data";
import { getWhatsAppOrderLink } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";
import { useNavigation } from "@/lib/navigation";
import { getCategoryIcon, ShoppingBagIcon } from "@/components/icons";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { ProductGridSkeleton } from "@/components/loading-skeletons";
import { OrderModal } from "@/components/order-modal";

const PRODUCTS_PER_PAGE = 12;

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['الكل']);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);
  const { navigateToProduct } = useNavigation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

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

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

  const goToPage = (page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    const params = new URLSearchParams(searchParams.toString());
    if (clampedPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(clampedPage));
    }
    const queryString = params.toString();
    router.push(queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname);
  };

  // Reset to page 1 when filter/search changes
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    goToPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (currentPage !== 1) {
      goToPage(1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

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
          <ProductGridSkeleton count={6} />
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
            <Input placeholder="ابحث عن منتج..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="ps-10 pe-10 rounded-xl" />
            {searchQuery && (
              <button onClick={() => handleSearchChange("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">مسح</button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? "btn-3d-sm shrink-0" : "shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">عرض {filteredProducts.length} منتج</p>

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
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
                    <Badge className="mb-2 cursor-pointer bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-xs font-semibold text-gold-gradient border border-amber-500/20 transition-all hover:border-amber-500/50 hover:scale-105" onClick={() => handleCategoryChange(product.category === selectedCategory ? "الكل" : product.category)}>
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
                    <div className="flex items-center gap-2">
                      {/* Golden Order Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setOrderingProduct(product); setOrderModalOpen(true); }}
                        className="flex-1 flex items-center justify-center gap-2 text-sm !py-3 !rounded-xl
                          bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold
                          shadow-md shadow-amber-500/20 hover:shadow-amber-500/30
                          transition-all active:scale-[0.98]"
                      >
                        <ShoppingCart className="size-4" />
                        اطلب الآن
                      </button>
                      {/* Inquiry Button */}
                      <a href={getWhatsAppOrderLink(product.name)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-3 text-xs font-medium transition-all hover:bg-accent no-underline shrink-0">
                        <WhatsAppIcon size={14} className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-lg"
                    onClick={() => goToPage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage <= 1}
                    aria-label="الصفحة السابقة"
                  >
                    <ChevronRight className="size-4" />
                  </Button>

                  {getPageNumbers().map((page, idx) =>
                    page === "ellipsis" ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={page === safeCurrentPage ? "default" : "outline"}
                        size="icon"
                        className={`size-9 rounded-lg ${page === safeCurrentPage ? "pointer-events-none" : ""}`}
                        onClick={() => goToPage(page)}
                        aria-label={`الصفحة ${page}`}
                        aria-current={page === safeCurrentPage ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-lg"
                    onClick={() => goToPage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage >= totalPages}
                    aria-label="الصفحة التالية"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  صفحة {safeCurrentPage} من {totalPages}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">لا توجد منتجات في هذا التصنيف</h3>
            <button className="btn-3d-sm mt-2" onClick={() => { handleCategoryChange("الكل"); handleSearchChange(""); }}>
              عرض جميع المنتجات
            </button>
          </div>
        )}
      </div>

      {/* Order Modal */}
      <OrderModal
        open={orderModalOpen}
        onOpenChange={setOrderModalOpen}
        product={
          orderingProduct
            ? {
                id: orderingProduct.id,
                name: orderingProduct.name,
                price: orderingProduct.price,
                salePrice: orderingProduct.salePrice,
                image: orderingProduct.images[0],
                category: orderingProduct.category,
                availability: orderingProduct.availability,
              }
            : null
        }
      />
    </div>
  );
}
