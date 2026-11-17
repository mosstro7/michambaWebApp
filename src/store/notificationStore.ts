import { create } from 'zustand';
import type { Notificacion } from '@/types';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/api';

interface NotificationState {
  items: Notificacion[];
  unreadCount: number;
  // Trae la primera página y el contador del servidor (reemplaza lo local).
  load: () => Promise<void>;
  // Suma una que llegó por socket; si ya está (mismo id) no hace nada.
  add: (n: Notificacion) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

// Se incrementa en cada reset(): una respuesta que llega después de un logout
// (o de otro load más nuevo) no pisa el estado.
let generation = 0;

// Sin persist: las notificaciones son del usuario logueado y se piden al servidor.
export const useNotificationStore = create<NotificationState>()((set, get) => ({
  items: [],
  unreadCount: 0,

  load: async () => {
    const gen = ++generation;
    try {
      const [page, { count }] = await Promise.all([getNotifications(), getUnreadCount()]);
      if (gen !== generation) return;
      set((state) => {
        // Las que llegaron por socket mientras la request estaba en vuelo y
        // son más nuevas que la página: se conservan arriba.
        const ids = new Set(page.items.map((i) => i.id));
        const newest = page.items[0]?.createdAt ?? '';
        const extra = state.items.filter((i) => !ids.has(i.id) && i.createdAt > newest);
        return {
          items: [...extra, ...page.items],
          unreadCount: count + extra.filter((i) => !i.leido).length,
        };
      });
    } catch (err) {
      console.error('[notifications] load:', err);
    }
  },

  add: (n) => {
    if (get().items.some((i) => i.id === n.id)) return;
    set((state) => ({
      items: [n, ...state.items],
      unreadCount: n.leido ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  markRead: async (id) => {
    const target = get().items.find((i) => i.id === id);
    if (target?.leido) return;
    // Optimista: se marca ya y, si el servidor falla, se recarga su estado.
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, leido: true } : i)),
      unreadCount: target ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }));
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error('[notifications] markRead:', err);
      get().load();
    }
  },

  markAllRead: async () => {
    set((state) => ({
      items: state.items.map((i) => (i.leido ? i : { ...i, leido: true })),
      unreadCount: 0,
    }));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error('[notifications] markAllRead:', err);
      get().load();
    }
  },

  reset: () => {
    generation++;
    set({ items: [], unreadCount: 0 });
  },
}));
