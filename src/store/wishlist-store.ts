import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistItem {
  id: string
  name: string
  price: number
  salePrice?: number
  image: string
  category: string
  addedAt: number
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (id: string) => void
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
  totalItems: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const exists = get().items.find((i) => i.id === item.id)
        if (!exists) {
          set({ items: [...get().items, { ...item, addedAt: Date.now() }] })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      toggleItem: (item) => {
        const exists = get().items.find((i) => i.id === item.id)
        if (exists) {
          get().removeItem(item.id)
        } else {
          get().addItem(item)
        }
      },

      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id)
      },

      clearWishlist: () => set({ items: [] }),

      totalItems: () => get().items.length,
    }),
    {
      name: 'elite-wishlist',
    }
  )
)
