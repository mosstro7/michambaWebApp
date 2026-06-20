import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  getChatMessages,
  getChat,
  acceptProposal,
  updateProposalStatus,
  createReport,
} from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/Button';
import { ConfirmModal, SuccessModal, FormModal } from '@/components/ui/Modal';
import { ChevronLeft, Send, Wifi, WifiOff, Flag, FileText, X } from 'lucide-react';
import { formatDateTime, formatCurrency, cn } from '@/utils';
import { Chat as ChatType, Role, ProposalStatus } from '@/types';

type ChatProposal = NonNullable<ChatType['propuesta']>;

export function Chat() {
  const { id: chatId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const tituloFromState = (location.state as any)?.titulo as string | undefined;

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatInfo, setChatInfo] = useState<ChatType | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [mobileProposalOpen, setMobileProposalOpen] = useState(false);
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
    if (!chatId) return;
    getChat(chatId)
      .then(setChatInfo)
      .catch((err) => console.error('[Chat] getChat:', err));
  }, [chatId]);

  const reloadChat = useCallback(() => {
    if (!chatId) return;
    getChat(chatId)
      .then(setChatInfo)
      .catch((err) => console.error('[Chat] reloadChat:', err));
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const interlocutor = useMemo(() => {
    const persona = user?.rol === Role.ESPECIALISTA ? chatInfo?.cliente : chatInfo?.especialista;
    if (persona) return `${persona.nombre} ${persona.apellido}`.trim();
    const other = messages.find((m) => m.remitenteId !== user?.id);
    if (!other?.remitente) return null;
    return `${other.remitente.nombre} ${other.remitente.apellido}`.trim();
  }, [chatInfo, messages, user?.id, user?.rol]);

  const tituloPedido = chatInfo?.pedido?.titulo ?? tituloFromState;
  const proposal = chatInfo?.propuesta ?? null;
  const hasProposal = proposal !== null;

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
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base leading-tight truncate">
            {interlocutor ?? tituloPedido ?? 'Chat'}
          </h1>
          {tituloPedido && (
            <p className="text-xs text-gray-400 truncate">{tituloPedido}</p>
          )}
        </div>
        {/* Propuesta button — mobile only, visible when proposal is loaded */}
        {hasProposal && (
          <button
            onClick={() => setMobileProposalOpen(true)}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold flex-shrink-0"
          >
            <FileText size={14} />
            Propuesta
          </button>
        )}
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
        {/* Flag — always visible; desktop users without sidebar can still report */}
        <button
          onClick={() => setReportOpen(true)}
          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
          title="Reportar conversación"
        >
          <Flag size={18} />
        </button>
      </div>

      {/* Body: sidebar + chat */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar — desktop only, shown when proposal is ready */}
        {hasProposal && (
          <aside className="hidden md:flex flex-col w-[300px] min-w-[300px] border-r border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Propuesta activa
              </h2>
            </div>
            <div className="flex-1 p-4">
              <ProposalPanelContent
                proposal={proposal}
                userRole={user?.rol}
                onUpdated={reloadChat}
              />
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setReportOpen(true)}
                className="flex w-full items-center gap-2 text-sm text-gray-400 hover:text-red-600 transition-colors"
              >
                <Flag size={15} />
                Reportar conversación
              </button>
            </div>
          </aside>
        )}

        {/* Chat column */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-100 shadow-inner">
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

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0"
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
      </div>

      {/* Mobile proposal drawer */}
      {mobileProposalOpen && proposal && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileProposalOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Propuesta activa</h2>
              <button
                onClick={() => setMobileProposalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <ProposalPanelContent
                proposal={proposal}
                userRole={user?.rol}
                onUpdated={() => {
                  reloadChat();
                  setMobileProposalOpen(false);
                }}
              />
              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setMobileProposalOpen(false);
                    setReportOpen(true);
                  }}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Flag size={15} />
                  Reportar conversación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportOpen && chatId && (
        <ReportModal chatId={chatId} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
}

// ─── Contenido del panel de propuesta (sidebar + drawer comparten este componente) ──

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  [ProposalStatus.ACEPTADA]: { label: 'Oferta aceptada', className: 'bg-green-100 text-green-700' },
  [ProposalStatus.RECHAZADA]: { label: 'Oferta rechazada', className: 'bg-red-100 text-red-700' },
  [ProposalStatus.RETIRADA]: { label: 'Propuesta retirada', className: 'bg-gray-200 text-gray-600' },
};

type ProposalAction = 'accept' | 'reject' | 'withdraw';

const CONFIRM_TEXT: Record<ProposalAction, { title: string; description?: string; danger?: boolean; confirmLabel: string }> = {
  accept: {
    title: '¿Aceptar esta oferta?',
    description: 'El pedido pasará a estado "En progreso" y se cerrará para los demás especialistas.',
    confirmLabel: 'Aceptar oferta',
  },
  reject: {
    title: '¿Rechazar esta oferta?',
    description: 'El especialista será notificado del rechazo.',
    danger: true,
    confirmLabel: 'Rechazar oferta',
  },
  withdraw: {
    title: '¿Estás seguro?',
    description: 'Esta acción no se puede deshacer.',
    danger: true,
    confirmLabel: 'Retirar propuesta',
  },
};

function ProposalPanelContent({
  proposal,
  userRole,
  onUpdated,
}: {
  proposal: ChatProposal;
  userRole?: Role;
  onUpdated: () => void;
}) {
  const [confirmAction, setConfirmAction] = useState<ProposalAction | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const isPendiente = proposal.estado === ProposalStatus.PENDIENTE;
  const isCliente = userRole === Role.CLIENTE;
  const isEspecialista = userRole === Role.ESPECIALISTA;
  const badge = STATUS_BADGE[proposal.estado];

  const runAction = async () => {
    if (!confirmAction) return;
    setActionError('');
    setIsSubmitting(true);
    try {
      if (confirmAction === 'accept') {
        await acceptProposal(proposal.id);
        setSuccessMessage('Oferta aceptada');
      } else if (confirmAction === 'reject') {
        await updateProposalStatus(proposal.id, ProposalStatus.RECHAZADA);
        setSuccessMessage('Oferta rechazada');
      } else {
        await updateProposalStatus(proposal.id, ProposalStatus.RETIRADA);
        setSuccessMessage('Propuesta retirada');
      }
      setConfirmAction(null);
    } catch (err: any) {
      setActionError(err.message || 'No se pudo completar la acción');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-200">
          {actionError}
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl font-bold text-gray-900">
          {formatCurrency(proposal.precioOferta)}
        </span>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {proposal.version != null && (
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
              v{proposal.version}
            </span>
          )}
          {badge && (
            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', badge.className)}>
              {badge.label}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 italic bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 leading-relaxed">
        "{proposal.descripcion}"
      </p>

      {isPendiente && isCliente && (
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => setConfirmAction('accept')}>
            Aceptar oferta
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setConfirmAction('reject')}
          >
            Rechazar oferta
          </Button>
        </div>
      )}

      {isPendiente && isEspecialista && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setConfirmAction('withdraw')}
        >
          Retirar propuesta
        </Button>
      )}

      {confirmAction && (
        <ConfirmModal
          title={CONFIRM_TEXT[confirmAction].title}
          description={CONFIRM_TEXT[confirmAction].description}
          confirmLabel={CONFIRM_TEXT[confirmAction].confirmLabel}
          danger={CONFIRM_TEXT[confirmAction].danger}
          isSubmitting={isSubmitting}
          onConfirm={runAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {successMessage && (
        <SuccessModal
          title={successMessage}
          onClose={() => {
            setSuccessMessage(null);
            onUpdated();
          }}
        />
      )}
    </div>
  );
}

// ─── Reportar conversación ────────────────────────────────────────────────────

function ReportModal({ chatId, onClose }: { chatId: string; onClose: () => void }) {
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      await createReport(chatId, motivo.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar el reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <SuccessModal
        title="Reporte enviado"
        description="El equipo de Mi Chamba revisará la conversación."
        onClose={onClose}
      />
    );
  }

  return (
    <FormModal title="Reportar conversación" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo del reporte
          </label>
          <textarea
            required
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Describí lo ocurrido en esta conversación..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent min-h-[120px]"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="danger"
            className="flex-1"
            isLoading={isSubmitting}
            disabled={!motivo.trim()}
          >
            Enviar reporte
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
