"use client";

import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart-store";
import { WhatsAppBrandIcon } from "@/components/icons";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalPrice,
    totalItems,
  } = useCartStore();

  const itemCount = totalItems();
  const total = totalPrice();

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) return;

    const orderLines = items
      .map(
        (item) =>
          `• ${item.name} × ${item.quantity} - ${
            item.salePrice && item.salePrice < item.price
              ? item.salePrice
              : item.price
          } ر.ي`
      )
      .join("\n");

    const message = `مرحباً، أود طلب المنتجات التالية:\n\n${orderLines}\n\nالمجموع: ${total} ر.ي\n\nشكراً لكم!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/967782138587?text=${encodedMessage}`,
      "_blank"
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="left" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-right">
            <ShoppingCart className="size-5 text-gold-gradient" />
            <span>سلة التسوق</span>
            {itemCount > 0 && (
              <Badge className="ms-2">{itemCount}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="size-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              السلة فارغة
            </p>
            <p className="text-sm text-muted-foreground">
              أضف منتجات للبدء بالتسوق
            </p>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-1 px-1">
                {items.map((item) => {
                  const effectivePrice =
                    item.salePrice && item.salePrice < item.price
                      ? item.salePrice
                      : item.price;

                  return (
                    <div
                      key={item.id}
                      className="card-3d group flex items-start gap-3 p-3"
                    >
                      {/* Product image placeholder */}
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <ShoppingCart className="size-5 text-muted-foreground" />
                      </div>

                      {/* Product info */}
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 line-clamp-1 text-sm font-semibold">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {item.salePrice && item.salePrice < item.price ? (
                            <>
                              <span className="text-sm font-bold text-gold-gradient">
                                {effectivePrice} ر.ي
                              </span>
                              <span className="text-xs text-muted-foreground line-through">
                                {item.price} ر.ي
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-bold">
                              {effectivePrice} ر.ي
                            </span>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center rounded-lg border">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="flex size-7 items-center justify-center transition-colors hover:bg-accent"
                              aria-label="تقليل الكمية"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="flex min-w-[2rem] items-center justify-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="flex size-7 items-center justify-center transition-colors hover:bg-accent"
                              aria-label="زيادة الكمية"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(effectivePrice * item.quantity).toFixed(0)} ر.ي
                          </span>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                        aria-label="حذف المنتج"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator className="my-2" />

            {/* Footer */}
            <SheetFooter className="flex-col gap-3">
              <div className="flex w-full items-center justify-between">
                <span className="text-sm text-muted-foreground">المجموع:</span>
                <span className="text-xl font-bold text-gold-gradient">
                  {total.toFixed(0)} ر.ي
                </span>
              </div>
              <button
                className="btn-3d-whatsapp flex w-full items-center justify-center gap-2"
                onClick={handleCheckoutWhatsApp}
              >
                <WhatsAppBrandIcon className="size-5" />
                إتمام الطلب عبر واتساب
              </button>
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-all hover:bg-accent"
                onClick={clearCart}
              >
                <Trash2 className="size-4" />
                تفريغ السلة
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
