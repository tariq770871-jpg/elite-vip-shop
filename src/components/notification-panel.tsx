"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Package, Tag, Truck, Check, X, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNotificationStore, type Notification } from "@/store/notification-store";

const typeConfig: Record<Notification["type"], { icon: React.ReactNode; color: string; bgColor: string }> = {
  order: {
    icon: <Package className="size-4" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  promo: {
    icon: <Tag className="size-4" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  system: {
    icon: <Bell className="size-4" />,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  shipping: {
    icon: <Truck className="size-4" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore();

  const unread = unreadCount();

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between text-right">
            <div className="flex items-center gap-2">
              <Bell className="size-5 text-gold-gradient" />
              <span>الإشعارات</span>
              {unread > 0 && <Badge>{unread}</Badge>}
            </div>
            {unread > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary hover:text-primary"
                onClick={markAllAsRead}
              >
                <Check className="size-3" />
                تحديد الكل كمقروء
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {notifications.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <Bell className="size-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-1 px-1">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={`group relative flex items-start gap-3 rounded-xl p-3 transition-all cursor-pointer hover:bg-accent ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    {/* Icon */}
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.bgColor} ${config.color}`}>
                      {config.icon}
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold">{notification.title}</h4>
                        {!notification.read && (
                          <div className="size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                      <span className="mt-1 block text-[10px] text-muted-foreground">{timeAgo(notification.createdAt)}</span>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                      aria-label="حذف"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Bell button with dropdown trigger
export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const unread = useNotificationStore((s) => s.unreadCount());

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative size-8 md:size-9"
        onClick={() => setOpen(true)}
        aria-label="الإشعارات"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <Badge className="absolute -top-0.5 -left-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 p-0 text-[9px] text-white hover:bg-red-500">
            {unread}
          </Badge>
        )}
      </Button>
      <NotificationPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
