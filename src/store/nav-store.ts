import { create } from 'zustand'

export type PageName =
  | 'home'
  | 'products'
  | 'apps'
  | 'ai-tools'
  | 'academy'
  | 'earning'
  | 'cart'
  | 'orders'
  | 'profile'
  | 'dashboard'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'return-policy'
  | 'shipping-policy'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'values'
  | 'criticism'
  | 'zero-protocols'
  | 'wishlist'
  | 'product-detail'
  | 'not-found'

interface NavStore {
  currentPage: PageName
  previousPage: PageName | null
  scrollToSection: string | null
  selectedProductId: string | null
  setCurrentPage: (page: PageName) => void
  goBack: () => void
  navigateToSection: (page: PageName, sectionId: string) => void
  clearScrollToSection: () => void
  setSelectedProductId: (id: string | null) => void
}

export const useNavStore = create<NavStore>((set, get) => ({
  currentPage: 'home' as PageName,
  previousPage: null,
  scrollToSection: null,
  selectedProductId: null,

  setCurrentPage: (page) =>
    set({ currentPage: page, previousPage: get().currentPage }),

  goBack: () => {
    const prev = get().previousPage
    if (prev) {
      set({ currentPage: prev, previousPage: null })
    }
  },

  navigateToSection: (page, sectionId) =>
    set({ currentPage: page, previousPage: get().currentPage, scrollToSection: sectionId }),

  clearScrollToSection: () =>
    set({ scrollToSection: null }),

  setSelectedProductId: (id) =>
    set({ selectedProductId: id }),
}))
