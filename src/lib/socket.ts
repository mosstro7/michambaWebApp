import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { refreshTokens, endSession } from '@/lib/api';

const WS_URL = import.meta.env.VITE_API_URL as string;

export interface AuthedSocket {
  socket: Socket;
  // Cierra el socket y evita que un refresh en curso lo vuelva a conectar.
  // Usar esto en vez de socket.disconnect().
  close: () => void;
}

// Socket autenticado con el token del store y recuperación ante auth rechazada.
// Cada llamada crea una conexión nueva; el que la crea es dueño de cerrarla.
export function createAuthedSocket(): AuthedSocket {
  let closed = false;
  // Token que viajó en el último handshake, para saber si otro refresh
  // (por ejemplo uno HTTP) ya lo renovó mientras tanto.
  let sentToken: string | null = null;
  // Un solo reintento por vencimiento; se rearma cuando la conexión entra.
  let retriedExpired = false;

  const socket = io(WS_URL, {
    // Se evalúa en cada intento de conexión (también en las reconexiones),
    // así siempre viaja el token vigente del store.
    auth: (cb) => {
      sentToken = useAuthStore.getState().token;
      cb({ token: sentToken });
    },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    retriedExpired = false;
  });

  // Si el backend rechaza el handshake por auth, socket.io-client no reconecta
  // solo. Sin `data.code` es un error de red y la reconexión automática sigue.
  socket.on('connect_error', async (err: Error & { data?: { code?: string } }) => {
    const code = err.data?.code;
    if (!code) return;

    if (code === 'TOKEN_INVALID' || code === 'TOKEN_MISSING') {
      endSession();
      return;
    }
    if (code !== 'TOKEN_EXPIRED' || retriedExpired) return;
    retriedExpired = true;

    try {
      // Igual que en HTTP: si el store ya tiene otro token, alcanza con reintentar.
      if (useAuthStore.getState().token === sentToken) await refreshTokens();
    } catch (refreshErr: any) {
      // 401: sesión vencida. Otro error (500, red caída): no se desloguea.
      if (refreshErr?.status === 401) endSession();
      return;
    }
    if (!closed) socket.connect();
  });

  return {
    socket,
    close: () => {
      closed = true;
      socket.disconnect();
    },
  };
}
