import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { createAuthedSocket } from '@/lib/socket';
import type { Notificacion } from '@/types';

// Socket propio de notificaciones, separado del de useChat: no hace join_chat
// ni escucha eventos del chat. Se monta una sola vez, en Layout.
export function useNotificationsSocket() {
  // Igual que useChat: depende de que haya sesión, no del token puntual, así
  // un refresh no recrea el socket.
  const hasToken = useAuthStore((s) => !!s.token);

  useEffect(() => {
    const { load, add, reset } = useNotificationStore.getState();

    if (!hasToken) {
      reset();
      return;
    }

    const { socket, close } = createAuthedSocket();

    // En cada conexión, incluidas las reconexiones, se trae el estado del
    // servidor para recuperar lo que llegó mientras estaba desconectado.
    socket.on('connect', () => {
      load();
    });

    socket.on('notification:new', (n: Notificacion) => {
      add(n);
    });

    return () => {
      close();
    };
  }, [hasToken]);
}
