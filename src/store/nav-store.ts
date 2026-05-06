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

interface NavStore {
  currentPage: PageName
  previousPage: PageName | null
  scrollToSection: string | null
  setCurrentPage: (page: PageName) => void
  goBack: () => void
  navigateToSection: (page: PageName, sectionId: string) => void
  clearScrollToSection: () => void
}

export const useNavStore = create<NavStore>((set, get) => ({
  currentPage: 'home' as PageName,
  previousPage: null,
  scrollToSection: null,

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
}))
