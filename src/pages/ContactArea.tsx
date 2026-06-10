import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders, getChatByOrder } from '@/lib/api';
import { Chat, Order } from '@/types';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

interface OrderChats {
  order: Order;
  chats: Chat[];
}

export function ContactArea() {
  const [orderChats, setOrderChats] = useState<OrderChats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders()
      .then(async (orders) => {
        const results = await Promise.all(
          orders.map(async (order) => {
            try {
              const chats = await getChatByOrder(order.id);
              return { order, chats };
            } catch {
              return { order, chats: [] as Chat[] };
            }
          }),
        );
        setOrderChats(results.filter((r) => r.chats.length > 0));
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

  return (
    <div className="space-y-6 pt-4 pb-20">
      <div>
        <h1 className="text-2xl font-bold">Área de Contacto</h1>
        <p className="text-gray-500 text-sm">Tus chats con especialistas, por pedido</p>
      </div>

      {orderChats.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-gray-500 font-medium">No tenés chats activos</p>
          <p className="text-sm text-gray-400">
            Aquí verás los chats que inicies con especialistas en tus pedidos.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orderChats.map(({ order, chats }) => (
            <OrderContactGroup key={order.id} order={order} chats={chats} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderContactGroup({ order, chats }: { order: Order; chats: Chat[] }) {
  return (
    <section className="space-y-2">
      <h3 className="font-bold text-gray-900 px-1">{order.titulo}</h3>
      <div className="space-y-2">
        {chats.map((chat) => (
          <SpecialistChatRow key={chat.id} chat={chat} />
        ))}
      </div>
    </section>
  );
}

function SpecialistChatRow({ chat }: { chat: Chat }) {
  const especialista = chat.especialista;
  const nombreEspecialista = especialista
    ? `${especialista.nombre} ${especialista.apellido}`.trim()
    : 'Especialista';
  const ultimoMensaje = chat.ultimoMensaje?.contenido || chat.ultimoMensaje?.content;

  return (
    <Link to={`/chats/${chat.id}`}>
      <Card className="hover:border-teal-500 transition-colors">
        <div className="flex items-center gap-3">
          <Avatar nombre={especialista?.nombre || 'E'} apellido={especialista?.apellido} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{nombreEspecialista}</p>
            <p className="text-sm text-gray-400 truncate">{ultimoMensaje || 'Sin mensajes aún'}</p>
          </div>
          <div className="flex items-center gap-1 text-sm text-teal-600 font-medium flex-shrink-0">
            Ir al chat
            <ArrowRight size={16} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
