import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getChatMessages } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Send, Wifi, WifiOff } from 'lucide-react';
import { formatDateTime } from '@/utils';

export function Chat() {
  const { id: chatId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const tituloFromState = (location.state as any)?.titulo as string | undefined;

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { messages, setMessages, isTyping, connected, sendMessage, emitTyping } = useChat(chatId);

  useEffect(() => {
    if (!chatId) return;
    setIsLoading(true);
    getChatMessages(chatId)
      .then(setMessages)
      .catch((err) => setError(err.message || 'Error al cargar mensajes'))
      .finally(() => setIsLoading(false));
  }, [chatId, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Derive the other participant's name from loaded messages
  const interlocutor = useMemo(() => {
    const other = messages.find((m) => m.remitenteId !== user?.id);
    if (!other?.remitente) return null;
    return `${other.remitente.nombre} ${other.remitente.apellido}`.trim();
  }, [messages, user?.id]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
    inputRef.current?.focus();
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(emitTyping, 300);
    },
    [emitTyping],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">{error}</h2>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 4rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base leading-tight truncate">
            {interlocutor ?? tituloFromState ?? 'Chat'}
          </h1>
          {interlocutor && tituloFromState && (
            <p className="text-xs text-gray-400 truncate">{tituloFromState}</p>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs flex-shrink-0">
          {connected ? (
            <Wifi size={14} className="text-teal-600" />
          ) : (
            <WifiOff size={14} className="text-gray-400" />
          )}
          <span className={connected ? 'text-teal-600' : 'text-gray-400'}>
            {connected ? 'Conectado' : 'Reconectando...'}
          </span>
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && !isLoading && (
          <p className="text-center text-gray-400 text-sm mt-10">
            No hay mensajes aún. ¡Empezá la conversación!
          </p>
        )}

        {messages.map((msg) => {
          const isOwn = msg.remitenteId === user?.id;
          const text = msg.contenido || msg.content || '';
          const senderName = msg.remitente
            ? `${msg.remitente.nombre} ${msg.remitente.apellido}`.trim()
            : isOwn
            ? 'Vos'
            : 'Usuario';

          return (
            <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              {!isOwn && (
                <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">{senderName}</span>
              )}
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                  isOwn
                    ? 'bg-teal-700 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                } ${msg.id.startsWith('temp-') ? 'opacity-70' : ''}`}
              >
                {text}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 mx-1">
                {formatDateTime(msg.createdAt)}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Escribí un mensaje..."
          className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || !connected}
          className="w-11 h-11 rounded-full bg-teal-700 text-white flex items-center justify-center disabled:opacity-40 hover:bg-teal-800 transition-colors flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
