"use client";

import { useCartStore } from "@/store/cart-store";
import { useNavStore } from "@/store/nav-store";
import { ShoppingCart, Package, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { WhatsAppBrandIcon } from "@/components/icons";

/* ------------------------------------------------------------------ */
/*  WhatsApp helper                                                    */
/* ------------------------------------------------------------------ */

function buildWhatsAppLink(items: ReturnType<typeof useCartStore.getState>["items"], total: number) {
  const lines = items.map(
    (item) =>
      `- ${item.name} × ${item.quantity} = ${(item.salePrice && item.salePrice < item.price ? item.salePrice : item.price * item.quantity).toLocaleString("ar-SA")} ريال يمني`
  );
  const msg = `مرحباً، أريد طلب المنتجات التالية:\n\n${lines.join("\n")}\n\nالمجموع الكلي: ${total.toLocaleString("ar-SA")} ريال يمني`;
  return `https://wa.me/967782138587?text=${encodeURIComponent(msg)}`;
}

/* ------------------------------------------------------------------ */
/*  Cart Page Section                                                  */
/* ------------------------------------------------------------------ */

export function CartPageSection() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);
  const { setCurrentPage } = useNavStore();

  const subtotal = totalPrice();
  const shipping = 0;
  const grandTotal = subtotal + shipping;

  if (items.length === 0) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="flex size-24 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="size-10 text-muted-foreground" />
        </div>
        <div className="section-title-3d">
          <span className="title-icon">
            <ShoppingCart className="size-6" />
          </span>
          سلتك فارغة
        </div>
        <p className="text-muted-foreground">لم تقم بإضافة أي منتجات بعد</p>
        <button className="btn-3d flex items-center gap-2" onClick={() => setCurrentPage("products")}>
          <ShoppingCart className="size-4" />
          تسوق الآن
        </button>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Title */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="section-title-3d">
            <span className="title-icon">
              <ShoppingCart className="size-6" />
            </span>
            سلة التسوق
          </div>
          <span className="rounded-full bg-gold-gradient px-3 py-0.5 text-xs font-bold text-black">
            {totalItems()} منتج
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {/* Header row (desktop) */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 text-sm font-medium text-muted-foreground">
              <div className="col-span-5">المنتج</div>
              <div className="col-span-2 text-center">السعر</div>
              <div className="col-span-3 text-center">الكمية</div>
              <div className="col-span-1 text-center">حذف</div>
              <div className="col-span-1 text-start">المجموع</div>
            </div>

            {items.map((item) => {
              const unitPrice = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
              const lineTotal = unitPrice * item.quantity;
              const hasSale = item.salePrice && item.salePrice < item.price;

              return (
                <div
                  key={item.id}
                  className="card-3d flex flex-col gap-3 p-4 md:grid md:grid-cols-12 md:items-center md:gap-4"
                >
                  {/* Product info */}
                  <div className="flex items-center gap-3 md:col-span-5">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Package className="size-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="md:col-span-2 md:text-center">
                    {hasSale ? (
                      <div>
                        <span className="font-bold text-gold-gradient">
                          {unitPrice.toLocaleString("ar-SA")} ريال يمني
                        </span>
                        <span className="ms-2 text-xs text-muted-foreground line-through">
                          {item.price.toLocaleString("ar-SA")}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold">
                        {unitPrice.toLocaleString("ar-SA")} ريال يمني
                      </span>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center justify-center gap-3 md:col-span-3 md:justify-center">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex size-8 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex size-8 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  {/* Remove */}
                  <div className="flex items-center md:col-span-1 md:justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="md:col-span-1 md:text-start">
                    <span className="font-bold text-gold-gradient">
                      {lineTotal.toLocaleString("ar-SA")} ريال يمني
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="gold-glow sticky top-24 rounded-2xl border bg-card p-6 space-y-4">
              <h2 className="text-lg font-bold">ملخص الطلب</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">{subtotal.toLocaleString("ar-SA")} ريال يمني</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الشحن</span>
                  <span className="font-medium text-green-600 dark:text-green-400">مجاناً</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">المجموع الكلي</span>
                    <span className="text-xl font-bold text-gold-gradient">
                      {grandTotal.toLocaleString("ar-SA")} ريال يمني
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Checkout */}
              <a
                href={buildWhatsAppLink(items, grandTotal)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d-whatsapp flex w-full items-center justify-center gap-3"
              >
                <WhatsAppBrandIcon className="size-5" />
                إتمام الطلب عبر واتساب
              </a>

              {/* Continue Shopping */}
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-all hover:bg-accent"
                onClick={() => setCurrentPage("products")}
              >
                <ArrowRight className="size-4" />
                متابعة التسوق
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
