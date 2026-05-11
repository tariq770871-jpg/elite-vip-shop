import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentlyViewedItem {
  id: string
  name: string
  price: number
  salePrice?: number
  category: string
  image: string
  viewedAt: number
}

interface RecentlyViewedStore {
  items: RecentlyViewedItem[]
  addItem: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void
  clearAll: () => void
}

/** Validate persisted recently-viewed data — guard against corrupted localStorage */
function validateRecentlyViewedItems(data: unknown): RecentlyViewedItem[] {
  if (!Array.isArray(data)) return []
  return data.filter((item): item is RecentlyViewedItem => {
    return (
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number' &&
      typeof item.category === 'string' &&
      typeof item.image === 'string' &&
      typeof item.viewedAt === 'number'
    )
  })
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
      merge: (persistedState, currentState) => {
        const ps = persistedState as { items?: unknown }
        return {
          ...currentState,
          ...(ps && typeof ps === 'object' ? ps : {}),
          items: validateRecentlyViewedItems((ps as Record<string, unknown>)?.items),
        }
      },
    }
  )
)
