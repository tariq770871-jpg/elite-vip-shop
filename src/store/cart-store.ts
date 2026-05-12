// src/store/cart-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const isDev = process.env.NODE_ENV === 'development'
const log = (...args: any[]) => isDev && console.log('[CART]', ...args)

export interface CartItem {
  id: string
  name: string
  price: number
  salePrice?: number
  image: string
  quantity: number
  category: string
  description?: string
  stock?: number
}

export interface Coupon {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  appliedCoupon: Coupon | null
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  totalPrice: () => number
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,

      addItem: (item) => {
        log('Adding:', item.name)
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id)
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (id) => {
        log('Removing:', id)
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return get().removeItem(id)
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }))
      },

      clearCart: () => {
        log('Cart cleared')
        set({ items: [], appliedCoupon: null })
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalPrice: () => {
        const { items, appliedCoupon } = get()
        const subtotal = items.reduce((sum, i) => {
          const price = i.salePrice && i.salePrice < i.price ? i.salePrice : i.price
          return sum + (price ?? 0) * (i.quantity ?? 1)
        }, 0)
        
        if (!appliedCoupon) return subtotal
        
        if (appliedCoupon.type === 'percentage') {
          return subtotal * (1 - appliedCoupon.discount / 100)
        }
        return Math.max(0, subtotal - appliedCoupon.discount)
      },

      applyCoupon: (coupon) => {
        log('Coupon applied:', coupon.code)
        set({ appliedCoupon: coupon })
      },

      removeCoupon: () => {
        log('Coupon removed')
        set({ appliedCoupon: null })
      },

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'elite-cart-storage',
      partialize: (state) => ({ items: state.items, appliedCoupon: state.appliedCoupon }),
    }
  )
)
