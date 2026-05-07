import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentlyViewedStore {
  items: Array<{ id: string; name: string; price: number; salePrice?: number; category: string; image: string; viewedAt: number }>
  addItem: (item: { id: string; name: string; price: number; salePrice?: number; category: string; image: string }) => void
  clearAll: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const filtered = get().items.filter((i) => i.id !== item.id)
        const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, 10)
        set({ items: updated })
      },

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'elite-recently-viewed',
    }
  )
)
