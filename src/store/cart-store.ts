import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItemType {
  id: string
  name: string
  price: number
  salePrice?: number
  image: string
  quantity: number
  category: string
}

interface AppliedCoupon {
  code: string
  discount: number
  discountAmount: number
  finalTotal: number
}

const MAX_QUANTITY_PER_ITEM = 99; // Prevent unrealistic order quantities

interface CartStore {
  items: CartItemType[]
  isOpen: boolean
  appliedCoupon: AppliedCoupon | null
  totalItemsCount: number   // pre-computed derived state
  totalPriceValue: number   // pre-computed derived state
  addItem: (item: Omit<CartItemType, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: () => number
  totalPrice: () => number
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
}

// ── Helper: compute derived totals from items array ──
// Called once on each mutation instead of on every render, avoiding
// repeated reduce() calls in consumer components.
function computeTotals(items: CartItemType[]) {
  let totalItemsCount = 0;
  let totalPriceValue = 0;
  for (const i of items) {
    totalItemsCount += i.quantity;
    const price = i.salePrice !== undefined && i.salePrice !== null && i.salePrice < i.price ? i.salePrice : i.price;
    totalPriceValue += price * i.quantity;
  }
  return { totalItemsCount, totalPriceValue };
}

// ── Validate cart items loaded from localStorage ──
function validateCartItems(items: unknown): CartItemType[] {
  if (!Array.isArray(items)) return []
  return items.filter((item): item is CartItemType =>
    item !== null &&
    typeof item === 'object' &&
    typeof item?.id === 'string' &&
    typeof item?.name === 'string' &&
    typeof item?.price === 'number' &&
    Number.isFinite(item.price) &&
    typeof item?.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= MAX_QUANTITY_PER_ITEM
  ).map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    salePrice: typeof item.salePrice === 'number' && Number.isFinite(item.salePrice) ? item.salePrice : undefined,
    image: typeof item.image === 'string' ? item.image : '',
    quantity: item.quantity,
    category: typeof item.category === 'string' ? item.category : '',
  }))
}

// ── Validate applied coupon loaded from localStorage ──
function validateAppliedCoupon(coupon: unknown): AppliedCoupon | null {
  if (!coupon || typeof coupon !== 'object') return null
  const c = coupon as Record<string, unknown>
  if (
    typeof c.code === 'string' &&
    typeof c.discount === 'number' && Number.isFinite(c.discount) &&
    typeof c.discountAmount === 'number' && Number.isFinite(c.discountAmount) &&
    typeof c.finalTotal === 'number' && Number.isFinite(c.finalTotal)
  ) {
    return { code: c.code, discount: c.discount, discountAmount: c.discountAmount, finalTotal: c.finalTotal }
  }
  return null
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,
      totalItemsCount: 0,
      totalPriceValue: 0,

      addItem: (item) => {
        const items = get().items
        const existing = items.find((i) => i.id === item.id)
        let newItems: CartItemType[];
        if (existing) {
          const newQty = Math.min(existing.quantity + 1, MAX_QUANTITY_PER_ITEM)
          newItems = items.map((i) =>
            i.id === item.id ? { ...i, quantity: newQty } : i
          )
        } else {
          newItems = [...items, { ...item, quantity: 1 }]
        }
        const totals = computeTotals(newItems);
        set({ items: newItems, appliedCoupon: null, ...totals });
      },

      removeItem: (id) => {
        const newItems = get().items.filter((i) => i.id !== id);
        const totals = computeTotals(newItems);
        set({ items: newItems, appliedCoupon: null, ...totals });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        const cappedQty = Math.min(quantity, MAX_QUANTITY_PER_ITEM)
        const newItems = get().items.map((i) => (i.id === id ? { ...i, quantity: cappedQty } : i));
        const totals = computeTotals(newItems);
        set({ items: newItems, appliedCoupon: null, ...totals });
      },

      clearCart: () => set({ items: [], appliedCoupon: null, totalItemsCount: 0, totalPriceValue: 0 }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // ── Backward-compatible getters ──
      // Pre-computed totalItemsCount / totalPriceValue should be preferred
      // since they don't recalculate on every render.
      totalItems: () => get().totalItemsCount,

      totalPrice: () => get().totalPriceValue,

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),
    }),
    {
      name: 'elite-cart',
      partialize: (state) => ({ items: state.items, appliedCoupon: state.appliedCoupon }),
      // ── Validate persisted data on hydration ──
      merge: (persistedState, currentState) => {
        const ps = persistedState as Record<string, unknown>
        const items = ps.items !== undefined ? validateCartItems(ps.items) : currentState.items;
        const appliedCoupon = ps.appliedCoupon !== undefined ? validateAppliedCoupon(ps.appliedCoupon) : currentState.appliedCoupon;
        const totals = computeTotals(items);
        return {
          ...currentState,
          items,
          appliedCoupon,
          ...totals,
        }
      },
    }
  )
)
