import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import api from '../services/api.js';
import type { Notification as INotification } from '../types/index.js';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  socket: Socket | null;
  activeToast: INotification | null;
  fetchNotifications: () => Promise<void>;
  initSocket: (token: string) => void;
  disconnectSocket: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  snoozeNotification: (id: string, hours?: number) => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  dismissToast: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,
  activeToast: null,

  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      set({
        notifications: res.data.data.notifications,
        unreadCount: res.data.data.unreadCount,
      });
    } catch {}
  },

  initSocket: (token: string) => {
    if (get().socket) return;

    const rawApiUrl = import.meta.env.VITE_API_URL || '';
    const socketOrigin = import.meta.env.VITE_SOCKET_URL || (rawApiUrl ? rawApiUrl.replace(/\/api\/?$/, '') : undefined);

    const socket = io(socketOrigin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to NEXUS notification gateway');
    });

    socket.on('notification:new', (notification: INotification) => {
      console.log('[Socket] Received real-time notification:', notification);
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        activeToast: notification,
      }));

      // Trigger native browser notification if granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const nativeNotif = new window.Notification(notification.title, {
            body: notification.message,
            icon: '/nexus-icon.svg',
            tag: notification._id,
          });
          nativeNotif.onclick = () => {
            window.focus();
            if (notification.linkedEntityType === 'project' && notification.linkedEntityId) {
              window.location.href = `/projects/${notification.linkedEntityId}`;
            } else if (notification.linkedEntityType === 'task') {
              window.location.href = `/tasks`;
            }
          };
        } catch {}
      }

      // Play subtle notification sound if available
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch {}
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, status: 'read' } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, status: 'read' })),
        unreadCount: 0,
      }));
    } catch {}
  },

  snoozeNotification: async (id: string, hours = 2) => {
    try {
      await api.patch(`/notifications/${id}/snooze`, { hours });
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  dismissNotification: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/dismiss`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  dismissToast: () => {
    set({ activeToast: null });
  },
}));
