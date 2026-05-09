"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Loader2,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getProducts, getCategories } from "@/lib/supabase-data";
import type { Product } from "@/lib/mock-data";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useNavStore } from "@/store/nav-store";
import { getCategoryIcon, ShoppingBagIcon } from "@/components/icons";

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['الكل']);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { setCurrentPage, setSelectedProductId } = useNavStore();

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

  const handleToggleWishlist = (product: Product) => {
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0],
      category: product.category,
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProductId(product.id);
    setCurrentPage("product-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="section-gradient-products py-8 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="section-title-3d">
              <span className="title-icon">
                <ShoppingBagIcon className="size-6" />
              </span>
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
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="section-title-3d">
              <span className="title-icon">
                <ShoppingBagIcon className="size-6" />
              </span>
              متجر منتجات النخبة
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 pe-10 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                مسح
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                className={
                  selectedCategory === cat
                    ? "btn-3d-sm shrink-0"
                    : "shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                }
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Count */}
        <p className="mb-6 text-sm text-muted-foreground">
          عرض {filteredProducts.length} منتج
        </p>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="card-3d group overflow-hidden"
              >
                {/* Image placeholder */}
                <div className="product-img-placeholder relative bg-muted cursor-pointer" onClick={() => handleProductClick(product)}>
                  {getCategoryIcon(product.category, "size-14 text-muted-foreground/40")}
                  {product.salePrice && (
                    <Badge className="absolute top-3 right-3 z-10 bg-red-500 text-white hover:bg-red-500 shadow-lg">
                      خصم{" "}
                      {Math.round(
                        ((product.price - product.salePrice) / product.price) *
                          100
                      )}
                      %
                    </Badge>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/10 active:bg-black/20">
                    <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm">عرض التفاصيل</span>
                  </div>
                  {/* Wishlist button on image */}
                  <button
                    className="touch-target absolute top-3 left-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:scale-110 dark:bg-black/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWishlist(product);
                    }}
                    aria-label={isInWishlist(product.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                  >
                    <Heart
                      className={`size-4 ${
                        isInWishlist(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </div>
                {/* Content */}
                <div className="p-4 sm:p-5">
                  <Badge
                    className="mb-2 cursor-pointer bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-xs font-semibold text-gold-gradient border border-amber-500/20 transition-all hover:border-amber-500/50 hover:scale-105"
                    onClick={() => setSelectedCategory(product.category === selectedCategory ? "الكل" : product.category)}
                  >
                    {product.category}
                  </Badge>
                  <h3 className="mb-2 line-clamp-1 text-lg font-bold">
                    {product.name}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mb-4 flex items-center gap-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-gold-gradient">
                          {product.salePrice} ر.ي
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {product.price} ر.ي
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gold-gradient">
                        {product.price} ر.ي
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-3d-sm w-full flex items-center justify-center gap-2"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="size-4" />
                    أضف للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              لا توجد منتجات في هذا التصنيف
            </h3>
            <p className="text-sm text-muted-foreground">
              جرب تغيير التصنيف أو البحث بكلمات مختلفة
            </p>
            <button
              className="btn-3d-sm mt-2"
              onClick={() => {
                setSelectedCategory("الكل");
                setSearchQuery("");
              }}
            >
              عرض جميع المنتجات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
