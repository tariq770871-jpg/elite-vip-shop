import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  seeded: boolean
  unreadCount: () => number
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

/** Time constants for seed notification offsets */
const DAY_MS = 86_400_000;     // 24 hours
const HALF_DAY_MS = 43_200_000; // 12 hours
const QUARTER_DAY_MS = 21_600_000; // 6 hours

/** Default seed notifications — shown once on first visit only */
const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'مرحباً بك في متجر النخبة!',
    message: 'استمتع بتجربة تسوق فاخرة مع أفضل المنتجات بأسعار لا تُقاوم.',
    type: 'system',
    read: false,
    createdAt: Date.now() - DAY_MS,
  },
  {
    id: 'n2',
    title: 'عرض خاص: خصم 30% على الإلكترونيات',
    message: 'لا تفوت فرصة الحصول على أفضل الإلكترونيات بخصم استثنائي. العرض ينتهي قريباً!',
    type: 'promo',
    read: false,
    createdAt: Date.now() - HALF_DAY_MS,
  },
  {
    id: 'n3',
    title: 'خدمة الشحن المجاني',
    message: 'الشحن مجاني لجميع الطلبات فوق 5000 ر.ي. استمتع بالتسوق بدون رسوم إضافية!',
    type: 'shipping',
    read: false,
    createdAt: Date.now() - QUARTER_DAY_MS,
  },
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      seeded: false,

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

      clearAll: () => set({ notifications: [], seeded: true }),
    }),
    {
      name: 'elite-notifications',
      merge: (persistedState, currentState) => {
        const ps = persistedState as { notifications?: unknown; seeded?: boolean }
        const persistedNotifications = Array.isArray(ps?.notifications) ? ps.notifications as Notification[] : [];
        const hasSeeded = ps?.seeded === true;

        // Only seed default notifications on the very first visit (no persisted data)
        if (!hasSeeded && persistedNotifications.length === 0) {
          return {
            ...currentState,
            notifications: SEED_NOTIFICATIONS,
            seeded: true,
          };
        }

        return {
          ...currentState,
          notifications: persistedNotifications,
          seeded: hasSeeded || persistedNotifications.length > 0,
        };
      },
    }
  )
)
