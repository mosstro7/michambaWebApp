import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getOrder,
  createProposal,
  acceptProposal,
  getChatByOrder,
  getMyProposals,
  updateProposal,
} from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { CATEGORIES } from '@/data/mockData';
import {
  OrderStatus,
  ProposalStatus,
  Role,
  Order,
  Proposal,
  ProposalVersionEntry,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { formatCurrency, formatDate, cn } from '@/utils';
import {
  ChevronLeft,
  ChevronDown,
  MapPin,
  Calendar,
  MessageCircle,
  X,
  CheckCircle,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

type OrderWithProposals = Order & { propuestas?: Proposal[] };

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isEspecialista = user?.rol === Role.ESPECIALISTA;

  const [order, setOrder] = useState<OrderWithProposals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [miPropuesta, setMiPropuesta] = useState<Proposal | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getOrder(id)
      .then((data) => {
        setOrder(data);
        if (data.estado === OrderStatus.EN_PROGRESO) {
          getChatByOrder(id)
            .then((chat) => setChatId(chat.id))
            .catch(() => {});
        }
      })
      .catch((err) => setError(err.message || 'Error al cargar el pedido'))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !isEspecialista) return;
    getMyProposals()
      .then((proposals) => {
        console.log('[OrderDetail] orderId actual:', id);
        console.log('[OrderDetail] GET /proposals/mine →', JSON.stringify(proposals, null, 2));
        const mine =
          proposals.find(
            (p) =>
              p.pedidoId === id ||
              (p as any).orderId === id ||
              p.pedido?.id === id,
          ) ?? null;
        console.log('[OrderDetail] miPropuesta encontrada:', mine);
        setMiPropuesta(mine);
      })
      .catch((err) => console.error('[OrderDetail] Error /proposals/mine:', err));
  }, [id, isEspecialista]);

  const goToChat = () => {
    if (chatId) {
      navigate(`/chats/${chatId}`);
    } else if (id) {
      setLoadingChat(true);
      getChatByOrder(id)
        .then((chat) => navigate(`/chats/${chat.id}`))
        .catch(() => setLoadingChat(false));
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    const result = await acceptProposal(proposalId);
    setOrder((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        estado: OrderStatus.EN_PROGRESO,
        propuestas: prev.propuestas?.map((p) => ({
          ...p,
          estado: p.id === proposalId ? ProposalStatus.ACEPTADA : ProposalStatus.RECHAZADA,
        })),
      };
    });
    const resolvedChatId = result.chatId || result.chat?.id;
    if (resolvedChatId) {
      navigate(`/chats/${resolvedChatId}`);
    } else if (id) {
      setLoadingChat(true);
      getChatByOrder(id)
        .then((chat) => navigate(`/chats/${chat.id}`))
        .catch(() => setLoadingChat(false));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">{error || 'Pedido no encontrado'}</h2>
        <Button onClick={() => navigate('/')} className="mt-4">
          Volver al inicio
        </Button>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === order.categoriaId);
  const isOwner = user?.id === order.clienteId;
  const propuestas = order.propuestas ?? [];
  const isEnProgreso = order.estado === OrderStatus.EN_PROGRESO;

  return (
    <div className="space-y-6 pt-4 pb-20">
      <div className="flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">Detalle del Pedido</h1>
      </div>

      <Card className="border-l-4 border-l-teal-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
            {category && <CategoryIcon name={category.icono} size={24} />}
          </div>
          <div>
            <h2 className="text-lg font-bold">{order.titulo || category?.nombre}</h2>
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <span className="flex items-center">
                <MapPin size={12} className="mr-1" /> {order.barrio}
              </span>
              <span className="flex items-center">
                <Calendar size={12} className="mr-1" /> {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
          {order.descripcion}
        </p>
      </Card>

      {/* CLIENTE: lista de propuestas recibidas */}
      {isOwner && (
        <section className="space-y-4">
          <h3 className="font-bold text-lg">Propuestas Recibidas ({propuestas.length})</h3>
          {propuestas.length > 0 ? (
            <div className="space-y-3">
              {propuestas.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  canAccept={order.estado === OrderStatus.ABIERTO}
                  onAccept={() => handleAcceptProposal(proposal.id)}
                  onGoToChat={goToChat}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">Aún no has recibido propuestas.</p>
              <p className="text-xs text-gray-400 mt-1">
                Te notificaremos cuando alguien se postule.
              </p>
            </div>
          )}
        </section>
      )}

      {/* CLIENTE: botón "Ir al Chat" cuando el pedido está en progreso */}
      {isOwner && isEnProgreso && (
        <div className="sticky bottom-4 mx-auto w-full md:relative bg-white p-4 rounded-2xl shadow-lg border border-teal-100">
          <Button
            className="w-full"
            isLoading={loadingChat}
            disabled={loadingChat}
            leftIcon={<MessageCircle size={18} />}
            onClick={goToChat}
          >
            Ir al Chat
          </Button>
        </div>
      )}

      {/* ESPECIALISTA: tarjeta inline con la propuesta existente */}
      {isEspecialista && miPropuesta && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Mi Propuesta</h3>
            {miPropuesta.version != null && (
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                Propuesta v{miPropuesta.version}
              </span>
            )}
          </div>
          <Card
            className={cn(
              miPropuesta.estado === ProposalStatus.ACEPTADA
                ? 'border-teal-400 bg-teal-50/40'
                : '',
            )}
          >
            {miPropuesta.estado === ProposalStatus.ACEPTADA && (
              <div className="flex items-center gap-2 text-teal-700 text-sm font-medium mb-4">
                <CheckCircle size={16} />
                Propuesta aceptada — no se puede modificar
              </div>
            )}
            <div className="space-y-3 mb-4">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                  Precio ofrecido
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(miPropuesta.precioOferta)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                  Mensaje
                </span>
                <p className="text-sm text-gray-700 italic bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 leading-relaxed">
                  "{miPropuesta.descripcion}"
                </p>
              </div>
            </div>

            {miPropuesta.versionHistory && miPropuesta.versionHistory.length > 0 && (
              <VersionHistoryAccordion versions={miPropuesta.versionHistory} />
            )}

            <div className="mt-4">
              {miPropuesta.estado === ProposalStatus.ACEPTADA ? (
                <Button
                  className="w-full"
                  leftIcon={<MessageCircle size={18} />}
                  isLoading={loadingChat}
                  disabled={loadingChat}
                  onClick={goToChat}
                >
                  Ir al Chat
                </Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setEditModalOpen(true)}>
                  Editar propuesta
                </Button>
              )}
            </div>
          </Card>
        </section>
      )}

      {/* ESPECIALISTA: CTA "Enviar mi Propuesta" solo cuando no hay propuesta propia */}
      {isEspecialista && !miPropuesta && order.estado === OrderStatus.ABIERTO && (
        <div className="sticky bottom-4 mx-auto w-full md:relative bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <Button className="w-full" onClick={() => setModalOpen(true)}>
            Enviar mi Propuesta
          </Button>
        </div>
      )}

      {modalOpen && id && (
        <ProposalModal orderId={id} onClose={() => setModalOpen(false)} />
      )}

      {editModalOpen && miPropuesta && (
        <EditProposalModal
          proposal={miPropuesta}
          onClose={() => setEditModalOpen(false)}
          onSaved={(updated) => setMiPropuesta(updated)}
          onGoToChat={() => {
            setEditModalOpen(false);
            goToChat();
          }}
        />
      )}
    </div>
  );
}

// ─── Nueva propuesta ────────────────────────────────────────────────────────

function ProposalModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [precio, setPrecio] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await createProposal(orderId, Number(precio), mensaje);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar la propuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Enviar Propuesta</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-6 space-y-3 text-center">
            <CheckCircle size={48} className="text-teal-700" />
            <p className="font-semibold text-lg">¡Propuesta enviada!</p>
            <p className="text-sm text-gray-500">El cliente verá tu oferta en breve.</p>
            <Button className="w-full mt-2" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio ofrecido (ARS)
              </label>
              <input
                type="number"
                required
                min={1}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Ej: 15000"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje para el cliente
              </label>
              <textarea
                required
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Contale tu experiencia, disponibilidad y por qué sos la mejor opción..."
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
                className="flex-1"
                isLoading={isSubmitting}
                disabled={!precio || !mensaje}
              >
                Enviar propuesta
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Editar propuesta existente ──────────────────────────────────────────────

function EditProposalModal({
  proposal,
  onClose,
  onSaved,
  onGoToChat,
}: {
  proposal: Proposal;
  onClose: () => void;
  onSaved: (updated: Proposal) => void;
  onGoToChat: () => void;
}) {
  const [precio, setPrecio] = useState(String(proposal.precioOferta));
  const [mensaje, setMensaje] = useState(proposal.descripcion);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const isAceptada = proposal.estado === ProposalStatus.ACEPTADA;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setIsSubmitting(true);
    try {
      const updated = await updateProposal(proposal.id, Number(precio), mensaje);
      setSaved(true);
      onSaved(updated);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold">Mi Propuesta</h3>
            {proposal.version != null && (
              <span className="text-xs text-teal-600 font-semibold">
                Propuesta v{proposal.version}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 mt-0.5">
            <X size={20} />
          </button>
        </div>

        {isAceptada ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-800 flex items-center gap-2">
              <CheckCircle size={16} className="flex-shrink-0" />
              Propuesta aceptada — no se puede modificar
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div>
                <span className="text-gray-500 font-medium">Precio: </span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(proposal.precioOferta)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Mensaje: </span>
                <span className="text-gray-700 italic">"{proposal.descripcion}"</span>
              </div>
            </div>
            <Button
              className="w-full"
              leftIcon={<MessageCircle size={18} />}
              onClick={onGoToChat}
            >
              Ir al Chat
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            {saved && (
              <div className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700 border border-teal-200 flex items-center gap-2">
                <CheckCircle size={16} />
                Cambios guardados
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio ofrecido (ARS)
              </label>
              <input
                type="number"
                required
                min={1}
                value={precio}
                onChange={(e) => { setPrecio(e.target.value); setSaved(false); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje para el cliente
              </label>
              <textarea
                required
                value={mensaje}
                onChange={(e) => { setMensaje(e.target.value); setSaved(false); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent min-h-[110px]"
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
                Cerrar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={isSubmitting}
                disabled={!precio || !mensaje}
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        )}

        {proposal.versionHistory && proposal.versionHistory.length > 0 && (
          <div className="mt-5">
            <VersionHistoryAccordion versions={proposal.versionHistory} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tarjeta de propuesta (vista cliente) ────────────────────────────────────

function ProposalCard({
  proposal,
  canAccept,
  onAccept,
  onGoToChat,
}: {
  proposal: Proposal;
  canAccept: boolean;
  onAccept: () => Promise<void>;
  onGoToChat: () => void;
}) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  const handleAccept = async () => {
    setAcceptError('');
    setIsAccepting(true);
    try {
      await onAccept();
    } catch (err: any) {
      setAcceptError(err.message || 'Error al aceptar la propuesta');
    } finally {
      setIsAccepting(false);
    }
  };

  const especialista = proposal.especialista;
  const nombreCompleto = especialista
    ? `${especialista.nombre} ${especialista.apellido}`.trim()
    : `Especialista #${proposal.especialistaId.slice(0, 6)}`;

  const isAceptada = proposal.estado === ProposalStatus.ACEPTADA;
  const isRechazada = proposal.estado === ProposalStatus.RECHAZADA;
  const hasHistory =
    proposal.versionHistory && proposal.versionHistory.length > 0;

  return (
    <Card
      className={cn(
        'transition-all',
        isAceptada
          ? 'border-teal-400 bg-teal-50/40'
          : isRechazada
          ? 'opacity-50'
          : 'hover:border-teal-400',
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar
            nombre={especialista?.nombre || 'Especialista'}
            apellido={especialista?.apellido}
            size="md"
          />
          <div>
            <h4 className="font-bold">{nombreCompleto}</h4>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'text-xs uppercase font-semibold',
                  isAceptada ? 'text-teal-700' : 'text-gray-400',
                )}
              >
                {isAceptada ? '✓ Aceptada' : isRechazada ? 'Rechazada' : 'Pendiente'}
              </span>
              {proposal.version != null && (
                <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">
                  v{proposal.version}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-400 block uppercase font-bold">Oferta</span>
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(proposal.precioOferta)}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 italic">"{proposal.descripcion}"</p>

      {acceptError && <p className="text-xs text-red-600 mb-3">{acceptError}</p>}

      {!isAceptada && !isRechazada && (
        <Button
          variant="primary"
          size="sm"
          className="w-full rounded-lg"
          isLoading={isAccepting}
          disabled={!canAccept || isAccepting}
          onClick={handleAccept}
        >
          Aceptar propuesta
        </Button>
      )}

      {isAceptada && (
        <Button
          size="sm"
          className="w-full rounded-lg"
          leftIcon={<MessageCircle size={16} />}
          onClick={onGoToChat}
        >
          Ir al Chat
        </Button>
      )}

      {hasHistory && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <VersionHistoryAccordion versions={proposal.versionHistory!} compact />
        </div>
      )}
    </Card>
  );
}

// ─── Historial de versiones (compartido) ────────────────────────────────────

function VersionHistoryAccordion({
  versions,
  compact = false,
}: {
  versions: ProposalVersionEntry[];
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={compact ? '' : 'pt-4 border-t border-gray-100'}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 font-medium',
          compact
            ? 'text-xs text-gray-400 hover:text-gray-600'
            : 'text-sm text-gray-500 hover:text-gray-700',
        )}
      >
        <ChevronDown
          size={compact ? 13 : 15}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
        {open ? 'Ocultar historial' : `Historial de versiones (${versions.length})`}
      </button>
      {open && (
        <ul className="mt-2 space-y-2">
          {versions
            .slice()
            .sort((a, b) => b.version - a.version)
            .map((v) => (
              <li
                key={v.version}
                className={cn(
                  'bg-gray-50 rounded-xl px-4 py-3',
                  compact ? 'text-xs' : 'text-sm',
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-teal-600 uppercase text-[10px]">
                    v{v.version}
                  </span>
                  <span className="text-gray-400 text-[10px]">{formatDate(v.creadoEn)}</span>
                </div>
                <div className="font-semibold text-gray-900">{formatCurrency(v.precio)}</div>
                <div className="text-gray-500 italic mt-0.5">"{v.mensaje}"</div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
