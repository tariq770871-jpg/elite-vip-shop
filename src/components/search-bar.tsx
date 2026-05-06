"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/supabase-data";
import type { Product } from "@/lib/mock-data";
import { useNavStore } from "@/store/nav-store";

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCurrentPage } = useNavStore();

  useEffect(() => {
    getProducts().then(d => setAllProducts(d));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query, allProducts]);

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (isOpen) {
      focusInput();
    }
  }, [isOpen, focusInput]);

  if (!isOpen) return null;

  const handleSelect = (productId: string) => {
    setCurrentPage("products");
    setQuery("");
    onClose();
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن منتجات، تطبيقات، أدوات..."
            className="ps-10 pe-10 h-11 text-base"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onClose();
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 size-8 -translate-y-1/2"
            onClick={onClose}
            aria-label="إغلاق البحث"
          >
            <X className="size-4" />
          </Button>

          {/* Search results dropdown */}
          {query.trim().length > 0 && (
            <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border bg-popover shadow-lg">
              {filteredProducts.length > 0 ? (
                <div className="py-1">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelect(product.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-accent"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Search className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {product.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <div className="shrink-0 text-start">
                        {product.salePrice ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-primary">
                              {product.salePrice}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {product.price}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {product.price}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground"> ر.ي</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Search className="mx-auto mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    لا توجد نتائج لـ &quot;{query}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
