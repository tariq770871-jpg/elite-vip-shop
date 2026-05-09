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

// ── Hash ↔ PageName mapping ──────────────────────────────────────────

const PAGE_TO_HASH: Record<PageName, string> = {
  home: '#/',
  products: '#/products',
  apps: '#/apps',
  'ai-tools': '#/ai-tools',
  academy: '#/academy',
  earning: '#/earning',
  cart: '#/cart',
  orders: '#/orders',
  profile: '#/profile',
  dashboard: '#/dashboard',
  about: '#/about',
  contact: '#/contact',
  privacy: '#/privacy',
  terms: '#/terms',
  'return-policy': '#/return-policy',
  'shipping-policy': '#/shipping-policy',
  login: '#/login',
  register: '#/register',
  'forgot-password': '#/forgot-password',
  values: '#/values',
  criticism: '#/criticism',
  'zero-protocols': '#/zero-protocols',
  wishlist: '#/wishlist',
  'product-detail': '#/product-detail',
  'not-found': '#/not-found',
}

const HASH_TO_PAGE: Record<string, PageName> = {
  '#/': 'home',
  '#/home': 'home',
  '#/products': 'products',
  '#/apps': 'apps',
  '#/ai-tools': 'ai-tools',
  '#/academy': 'academy',
  '#/earning': 'earning',
  '#/cart': 'cart',
  '#/orders': 'orders',
  '#/profile': 'profile',
  '#/dashboard': 'dashboard',
  '#/about': 'about',
  '#/contact': 'contact',
  '#/privacy': 'privacy',
  '#/terms': 'terms',
  '#/return-policy': 'return-policy',
  '#/shipping-policy': 'shipping-policy',
  '#/login': 'login',
  '#/register': 'register',
  '#/forgot-password': 'forgot-password',
  '#/values': 'values',
  '#/criticism': 'criticism',
  '#/zero-protocols': 'zero-protocols',
  '#/wishlist': 'wishlist',
  '#/product-detail': 'product-detail',
  '#/not-found': 'not-found',
}

// ── Helpers ───────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/** Parse hash and return { page, productId } */
function parseHash(hash: string): { page: PageName; productId: string | null } {
  // Handle #/product/{id}
  const productMatch = hash.match(/^#\/product\/(.+)$/)
  if (productMatch) {
    return { page: 'product-detail', productId: productMatch[1] }
  }

  const page = HASH_TO_PAGE[hash]
  if (page) {
    return { page, productId: null }
  }

  return { page: 'home' as PageName, productId: null }
}

/** Build hash from page and optional productId */
function buildHash(page: PageName, productId: string | null): string {
  if (page === 'product-detail' && productId) {
    return `#/product/${productId}`
  }
  return PAGE_TO_HASH[page]
}

// ── Read initial state from URL hash (SSR-safe) ──────────────────────

function getInitialState() {
  if (!isBrowser()) {
    return { currentPage: 'home' as PageName, selectedProductId: null as string | null }
  }
  const hash = window.location.hash || '#/'
  return parseHash(hash)
}

// ── Store ─────────────────────────────────────────────────────────────

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
  /** Sync store from the current hash (used by hashchange listener) */
  _syncFromHash: () => void
}

export const useNavStore = create<NavStore>((set, get) => {
  const initial = getInitialState()

  return {
    currentPage: initial.currentPage,
    previousPage: null,
    scrollToSection: null,
    selectedProductId: initial.selectedProductId,

    setCurrentPage: (page) => {
      set({ currentPage: page, previousPage: get().currentPage })
      if (isBrowser()) {
        const hash = buildHash(page, get().selectedProductId)
        // Only update if different to avoid polluting history
        if (window.location.hash !== hash) {
          window.location.hash = hash
        }
      }
    },

    goBack: () => {
      const prev = get().previousPage
      if (prev) {
        set({ currentPage: prev, previousPage: null })
        if (isBrowser()) {
          const hash = buildHash(prev, get().selectedProductId)
          window.location.hash = hash
        }
      }
    },

    navigateToSection: (page, sectionId) => {
      set({ currentPage: page, previousPage: get().currentPage, scrollToSection: sectionId })
      if (isBrowser()) {
        const hash = buildHash(page, get().selectedProductId)
        if (window.location.hash !== hash) {
          window.location.hash = hash
        }
      }
    },

    clearScrollToSection: () =>
      set({ scrollToSection: null }),

    setSelectedProductId: (id) => {
      set({ selectedProductId: id })
      // If we're on product-detail, update the hash to reflect the new ID
      if (id && get().currentPage === 'product-detail' && isBrowser()) {
        const hash = `#/product/${id}`
        if (window.location.hash !== hash) {
          window.location.hash = hash
        }
      }
    },

    /** Internal: re-sync store state from the current window hash */
    _syncFromHash: () => {
      if (!isBrowser()) return
      const hash = window.location.hash || '#/'
      const { page, productId } = parseHash(hash)
      const current = get()
      // Only update if the resolved page actually changed
      if (page !== current.currentPage || productId !== current.selectedProductId) {
        set({
          previousPage: current.currentPage !== page ? current.currentPage : current.previousPage,
          currentPage: page,
          selectedProductId: productId,
        })
      }
    },
  }
})

// ── Hash change listener (runs once on client) ────────────────────────

if (isBrowser()) {
  window.addEventListener('hashchange', () => {
    useNavStore.getState()._syncFromHash()
  })
}
