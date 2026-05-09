import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'promo' | 'system' | 'shipping'
  read: boolean
  createdAt: number
  link?: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: () => number
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    {
      id: 'n1',
      title: 'مرحباً بك في متجر النخبة!',
      message: 'استمتع بتجربة تسوق فاخرة مع أفضل المنتجات بأسعار لا تُقاوم.',
      type: 'system',
      read: false,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'n2',
      title: 'عرض خاص: خصم 30% على الإلكترونيات',
      message: 'لا تفوت فرصة الحصول على أفضل الإلكترونيات بخصم استثنائي. العرض ينتهي قريباً!',
      type: 'promo',
      read: false,
      createdAt: Date.now() - 43200000,
    },
    {
      id: 'n3',
      title: 'خدمة الشحن المجاني',
      message: 'الشحن مجاني لجميع الطلبات فوق 5000 ر.ي. استمتع بالتسوق بدون رسوم إضافية!',
      type: 'shipping',
      read: false,
      createdAt: Date.now() - 21600000,
    },
  ],

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `n-${Date.now()}`,
      read: false,
      createdAt: Date.now(),
    }
    set({ notifications: [newNotification, ...get().notifications] })
  },

  markAsRead: (id) => {
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })
  },

  markAllAsRead: () => {
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
    })
  },

  removeNotification: (id) => {
    set({ notifications: get().notifications.filter((n) => n.id !== id) })
  },

  clearAll: () => set({ notifications: [] }),
}))
