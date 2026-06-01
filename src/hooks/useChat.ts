import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import type { MessageWithSender } from '@/types';

const WS_URL = import.meta.env.VITE_API_URL as string;

export function useChat(chatId: string | undefined) {
  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!chatId || !token) return;

    const socket = io(WS_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_chat', { chatId });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('new_message', (message: MessageWithSender) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        return exists ? prev : [...prev, message];
      });
    });

    socket.on('typing', ({ userId }: { userId: string }) => {
      if (userId === user?.id) return;
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2500);
    });

    return () => {
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [chatId, token, user?.id]);

  const sendMessage = useCallback(
    (contenido: string) => {
      if (!socketRef.current || !chatId) return;
      socketRef.current.emit('send_message', { chatId, contenido });
    },
    [chatId],
  );

  const emitTyping = useCallback(() => {
    if (!socketRef.current || !chatId) return;
    socketRef.current.emit('typing', { chatId });
  }, [chatId]);

  return { messages, setMessages, isTyping, connected, sendMessage, emitTyping };
}
