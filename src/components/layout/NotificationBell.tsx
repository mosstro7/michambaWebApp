import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import type { Notificacion } from '@/types';
import { cn } from '@/utils';

const MAX_VISIBLE = 20;

const rtf = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' });

function timeAgo(date: string): string {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'recién';
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(seconds / 86400), 'day');
  if (abs < 86400 * 365) return rtf.format(Math.round(seconds / (86400 * 30)), 'month');
  return rtf.format(Math.round(seconds / (86400 * 365)), 'year');
}

// Rutas de App.tsx: /chats/:id y /order/:id.
function targetPath(n: Notificacion): string | null {
  if (n.chatId) return `/chats/${n.chatId}`;
  if (n.pedidoId) return `/order/${n.pedidoId}`;
  return null;
}

export function NotificationBell() {
  const items = useNotificationStore((s) => s.items);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleClick = (n: Notificacion) => {
    setOpen(false);
    if (!n.leido) markRead(n.id);
    const path = targetPath(n);
    if (path) navigate(path);
  };

  const visible = items.slice(0, MAX_VISIBLE);
  const badge = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-gray-500 hover:text-teal-700 transition-colors"
        aria-label={unreadCount > 0 ? `Notificaciones (${unreadCount} sin leer)` : 'Notificaciones'}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-[18px] text-center">
            {badge}
          </span>
        )}
      </button>

      {open && (
        // Mobile: panel de ancho completo bajo el navbar (h-16). Desktop: dropdown.
        // Queda dentro del <nav> (z-50), por debajo de los modales (z-[100]).
        <div
          className={cn(
            'fixed left-0 right-0 top-16 bg-white border-b border-gray-200 shadow-lg',
            'md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-96 md:rounded-xl md:border',
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900">Notificaciones</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No tenés notificaciones</p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
              {visible.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className={cn(
                      'w-full text-left px-4 py-3 flex gap-3 transition-colors',
                      n.leido ? 'bg-white hover:bg-gray-50' : 'bg-teal-50 hover:bg-teal-100',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1.5 w-2 h-2 rounded-full flex-shrink-0',
                        n.leido ? 'bg-transparent' : 'bg-teal-600',
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1 min-w-0">
                      <span
                        className={cn(
                          'block text-sm break-words',
                          n.leido ? 'text-gray-600' : 'text-gray-900 font-medium',
                        )}
                      >
                        {n.contenido}
                      </span>
                      <span className="block text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
