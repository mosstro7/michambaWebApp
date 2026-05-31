import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORIES } from '@/data/mockData';
import { useAuthStore } from '@/store/authStore';
import { getOrders, getMyOrders } from '@/lib/api';
import { Role, OrderStatus, Order } from '@/types';
import { formatDate, cn } from '@/utils';
import { Plus, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { HorizontalScroll } from '@/components/ui/HorizontalScroll';

export function Dashboard() {
  const { user } = useAuthStore();
  const isCliente = user?.rol === Role.CLIENTE;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const fetch = isCliente ? getMyOrders() : getOrders();
    fetch
      .then(setOrders)
      .catch((err) => setError(err.message || 'Error al cargar pedidos'))
      .finally(() => setIsLoading(false));
  }, [isCliente]);

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

  if (isCliente) {
    return <ClienteDashboard orders={orders} />;
  }

  return <EspecialistaDashboard orders={orders} />;
}

function ClienteDashboard({ orders }: { orders: Order[] }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Pedidos</h1>
          <p className="text-gray-500 text-sm">Gestiona tus solicitudes de servicio</p>
        </div>
        <Button
          size="sm"
          className="hidden md:flex"
          onClick={() => navigate('/new-order')}
          leftIcon={<Plus size={18} />}
        >
          Nuevo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.length > 0 ? (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div>
              <h3 className="font-semibold text-lg">No tienes pedidos aún</h3>
              <p className="text-gray-500">Publica tu primera necesidad para recibir propuestas.</p>
            </div>
            <Button onClick={() => navigate('/new-order')}>Publicar Pedido</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function EspecialistaDashboard({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState('ALL');

  const visible = orders.filter(
    (o) =>
      o.estado === OrderStatus.ABIERTO && (filter === 'ALL' || o.categoriaId === filter),
  );

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Feed de Pedidos</h1>
          <p className="text-gray-500 text-sm">Encuentra nuevas oportunidades de trabajo</p>
        </div>

        <HorizontalScroll>
          <Button
            size="sm"
            variant={filter === 'ALL' ? 'primary' : 'outline'}
            onClick={() => setFilter('ALL')}
            className="rounded-full flex-shrink-0"
          >
            Todos
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={filter === cat.id ? 'primary' : 'outline'}
              onClick={() => setFilter(cat.id)}
              className="rounded-full flex-shrink-0 whitespace-nowrap"
              leftIcon={<CategoryIcon name={cat.icono} size={16} />}
            >
              {cat.nombre}
            </Button>
          ))}
        </HorizontalScroll>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.length > 0 ? (
          visible.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No hay pedidos disponibles en esta categoría.
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const category = CATEGORIES.find((c) => c.id === order.categoriaId);
  const statusColors = {
    [OrderStatus.ABIERTO]: 'bg-green-100 text-green-700',
    [OrderStatus.EN_PROGRESO]: 'bg-blue-100 text-blue-700',
    [OrderStatus.FINALIZADO]: 'bg-gray-100 text-gray-700',
    [OrderStatus.CANCELADO]: 'bg-red-100 text-red-700',
  };

  return (
    <Link to={`/order/${order.id}`}>
      <Card className="hover:border-teal-500 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-700">
              {category ? (
                <CategoryIcon name={category.icono} size={20} />
              ) : (
                <Briefcase size={20} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">
                {order.titulo || category?.nombre}
              </h3>
              <p className="text-xs text-gray-500">{order.barrio}</p>
            </div>
          </div>
          <span
            className={cn(
              'text-[10px] font-bold px-2 py-1 rounded-full uppercase',
              statusColors[order.estado as OrderStatus],
            )}
          >
            {order.estado}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">{order.descripcion}</p>

        <div className="flex justify-end items-center pt-3 border-t border-gray-50 text-[10px] sm:text-xs">
          <div className="flex flex-col items-end">
            <span className="text-gray-400 uppercase font-medium">Publicado</span>
            <span className="text-gray-900">{formatDate(order.createdAt)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
