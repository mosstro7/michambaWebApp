import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import type { MessageWithSender } from '@/types';

const WS_URL = import.meta.env.VITE_API_URL as string;

export function useChat(chatId: string | undefined) {
  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const userRef = useRef(user);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    if (!chatId || !token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    // Listeners registered BEFORE connect fires
    socket.on('new_message', (message: MessageWithSender) => {
      // Normalize: gateway may send 'content' instead of 'contenido'
      if (!message.contenido && message.content) {
        message.contenido = message.content;
      }
      console.log('[useChat] new_message received:', message);
      setMessages((prev) => {
        // Replace optimistic placeholder if sender + content match
        const tempIdx = prev.findIndex(
          (m) =>
            m.id.startsWith('temp-') &&
            m.remitenteId === message.remitenteId &&
            m.contenido === message.contenido,
        );
        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = message;
          return updated;
        }
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
      console.log('[useChat] connected, joining chat:', chatId);
      setConnected(true);
      socket.emit('join_chat', { chatId });
      console.log('[useChat] join_chat emitted:', { chatId });
    });

    socket.on('disconnect', (reason) => {
      console.log('[useChat] disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[useChat] connect_error:', err.message);
    });

    return () => {
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [chatId, token]);

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
      console.log('[useChat] send_message emitted:', { chatId, content: contenido });
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
