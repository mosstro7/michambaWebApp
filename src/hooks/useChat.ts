import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { createAuthedSocket } from '@/lib/socket';
import type { MessageWithSender } from '@/types';

export function useChat(chatId: string | undefined, onSocketError?: (message: string) => void) {
  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const userRef = useRef(user);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => { userRef.current = user; }, [user]);

  // El socket depende de que haya sesión, no del token puntual: con `auth` como
  // función, un refresh no necesita recrear el socket.
  const hasToken = !!token;

  useEffect(() => {
    if (!chatId || !hasToken) return;

    // Auth del handshake y recuperación ante TOKEN_EXPIRED/INVALID/MISSING: src/lib/socket.ts
    const { socket, close } = createAuthedSocket();
    socketRef.current = socket;

    // Listeners registered BEFORE connect fires
    socket.on('new_message', (message: MessageWithSender) => {
      // Normalize: gateway may send 'content' instead of 'contenido'
      if (!message.contenido && message.content) {
        message.contenido = message.content;
      }
      setMessages((prev) => {
        // Solo un mensaje propio puede confirmar un temporal: mismo contenido y
        // mismo remitente. Así, si el otro participante manda el mismo texto
        // mientras el nuestro está pendiente, no lo reemplaza.
        const tempIdx = prev.findIndex(
          (m) =>
            m.id.startsWith('temp-') &&
            m.contenido === message.contenido &&
            message.remitenteId === userRef.current?.id,
        );
        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = message;
          return updated;
        }
        // No temp found → message from the other participant; dedup by real id.
        return prev.some((m) => m.id === message.id) ? prev : [...prev, message];
      });
    });

    socket.on('typing', ({ userId }: { userId: string }) => {
      if (userId === userRef.current?.id) return;
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2500);
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_chat', { chatId });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('exception', (err: { message?: string; status?: string } | string) => {
      const msg = typeof err === 'string' ? err : (err.message ?? 'Error al enviar el mensaje');
      console.error('[useChat] exception:', msg);
      onSocketError?.(msg);
      // Remove optimistic temp messages — server rejected the send
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
    });

    return () => {
      close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [chatId, hasToken]);

  const sendMessage = useCallback(
    (contenido: string) => {
      if (!socketRef.current || !chatId) return;
      const currentUser = userRef.current;
      // Optimistic update — shows message immediately without waiting for server echo
      if (currentUser) {
        setMessages((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            chatId,
            remitenteId: currentUser.id,
            contenido,
            leido: false,
            createdAt: new Date().toISOString(),
            remitente: {
              id: currentUser.id,
              nombre: currentUser.nombre,
              apellido: currentUser.apellido,
            },
          },
        ]);
      }
      socketRef.current.emit('send_message', { chatId, content: contenido });
    },
    [chatId],
  );

  const emitTyping = useCallback(() => {
    if (!socketRef.current || !chatId) return;
    socketRef.current.emit('typing', { chatId });
  }, [chatId]);

  return { messages, setMessages, isTyping, connected, sendMessage, emitTyping };
}
