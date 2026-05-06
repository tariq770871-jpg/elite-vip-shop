import { create } from 'zustand'

interface CartItemType {
  id: string
  name: string
  price: number
  salePrice?: number
  image: string
  quantity: number
  category: string
}

interface CartStore {
  items: CartItemType[]
  isOpen: boolean
  addItem: (item: Omit<CartItemType, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (item) => {
    const items = get().items
    const existing = items.find((i) => i.id === item.id)
    if (existing) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({ items: [...items, { ...item, quantity: 1 }] })
    }
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) })
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })
  },

  clearCart: () => set({ items: [] }),
  toggleCart: () => set({ isOpen: !get().isOpen }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () =>
    get().items.reduce((sum, i) => {
      const price = i.salePrice && i.salePrice < i.price ? i.salePrice : i.price
      return sum + price * i.quantity
    }, 0),
}))
