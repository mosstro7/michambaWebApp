import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyProposals, getChats } from '@/lib/api';
import { Chat, ProposalStatus, ProposalWithOrder } from '@/types';
import { formatCurrency, cn } from '@/utils';
import { MapPin, User, ArrowRight, Briefcase, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

type Tab = 'trabajos' | 'propuestas';

const STATUS_STYLES: Record<ProposalStatus, string> = {
  [ProposalStatus.ACEPTADA]: 'bg-teal-100 text-teal-700',
  [ProposalStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-700',
  [ProposalStatus.RECHAZADA]: 'bg-red-100 text-red-600',
  [ProposalStatus.RETIRADA]: 'bg-gray-200 text-gray-600',
};

const STATUS_LABELS: Record<ProposalStatus, string> = {
  [ProposalStatus.ACEPTADA]: 'Aceptada',
  [ProposalStatus.PENDIENTE]: 'Pendiente',
  [ProposalStatus.RECHAZADA]: 'Rechazada',
  [ProposalStatus.RETIRADA]: 'Retirada',
};

export function MyJobs() {
  const [activeTab, setActiveTab] = useState<Tab>('trabajos');
  const [chats, setChats] = useState<Chat[]>([]);
  const [allProposals, setAllProposals] = useState<ProposalWithOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getChats(), getMyProposals()])
      .then(([chatsData, proposalsData]) => {
        setChats(chatsData);
        setAllProposals(proposalsData);
      })
      .catch((err) => setError(err.message || 'Error al cargar'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  const propuestas = allProposals;

  return (
    <div className="space-y-0 pt-4 pb-20">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Mis Trabajos</h1>
        <p className="text-gray-500 text-sm">Seguimiento de tus propuestas y trabajos activos</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        <TabButton
          active={activeTab === 'trabajos'}
          icon={<Briefcase size={15} />}
          label="Mis Trabajos"
          count={chats.length}
          onClick={() => setActiveTab('trabajos')}
        />
        <TabButton
          active={activeTab === 'propuestas'}
          icon={<FileText size={15} />}
          label="Mis Propuestas"
          count={propuestas.length}
          onClick={() => setActiveTab('propuestas')}
        />
      </div>

      {activeTab === 'trabajos' ? (
        chats.length === 0 ? (
          <EmptyState
            message="No tenés trabajos activos"
            detail="Aquí verás tus chats cuando un cliente te elija o te escriba."
          />
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <ChatJobCard key={chat.id} chat={chat} />
            ))}
          </div>
        )
      ) : propuestas.length === 0 ? (
        <EmptyState
          message="No enviaste propuestas aún"
          detail="Explorá el feed y postulate a pedidos que te interesen."
        />
      ) : (
        <div className="space-y-3">
          {propuestas.map((p) => (
            <ProposalRow key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors',
        active
          ? 'border-teal-600 text-teal-700'
          : 'border-transparent text-gray-500 hover:text-gray-700',
      )}
    >
      {icon}
      {label}
      <span
        className={cn(
          'text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5',
          active ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500',
        )}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyState({ message, detail }: { message: string; detail: string }) {
  return (
    <div className="py-16 text-center space-y-2">
      <p className="text-gray-500 font-medium">{message}</p>
      <p className="text-sm text-gray-400">{detail}</p>
    </div>
  );
}

// ─── Tarjeta de chat activo ──────────────────────────────────────────────────

function ChatJobCard({ chat }: { chat: Chat }) {
  const pedido = chat.pedido;
  const cliente = chat.cliente;
  const nombreCliente = cliente ? `${cliente.nombre} ${cliente.apellido}`.trim() : null;
  const ultimoMensaje = chat.ultimoMensaje?.contenido || chat.ultimoMensaje?.content;

  return (
    <Link to={`/chats/${chat.id}`}>
      <Card className="hover:border-teal-500 transition-colors">
        <div className="flex items-start gap-3">
          {cliente ? (
            <Avatar nombre={cliente.nombre} apellido={cliente.apellido} size="md" />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-gray-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{pedido?.titulo || 'Pedido'}</h3>
            {nombreCliente ? (
              <p className="text-sm text-teal-700 font-medium">{nombreCliente}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Cliente</p>
            )}
            <p className="text-sm text-gray-400 truncate mt-1">{ultimoMensaje || 'Sin mensajes aún'}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
          <span>Ir al chat</span>
          <ArrowRight size={16} className="text-teal-600" />
        </div>
      </Card>
    </Link>
  );
}

// ─── Fila de propuesta enviada ───────────────────────────────────────────────

function ProposalRow({ proposal }: { proposal: ProposalWithOrder }) {
  console.log('[ProposalRow] proposal object:', proposal);
  const pedido = proposal.pedido;
  const navigate = useNavigate();

  return (
    <Card className="hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 truncate">
              {pedido?.titulo || 'Pedido'}
            </h3>
            {proposal.version != null && (
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                v{proposal.version}
              </span>
            )}
          </div>
          {pedido?.barrio && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={11} />
              {pedido.barrio}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-1 rounded-full uppercase',
                STATUS_STYLES[proposal.estado],
              )}
            >
              {STATUS_LABELS[proposal.estado]}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(proposal.precioOferta)}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="flex-shrink-0 rounded-lg"
          onClick={() => navigate(`/order/${proposal.pedidoId ?? proposal.pedido?.id}`)}
          rightIcon={<ArrowRight size={14} />}
        >
          Ver detalle
        </Button>
      </div>
    </Card>
  );
}
