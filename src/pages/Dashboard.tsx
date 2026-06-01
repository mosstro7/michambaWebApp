import { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORIES } from '@/data/mockData';
import { useAuthStore } from '@/store/authStore';
import { getOrders, getMyOrders } from '@/lib/api';
import { Role, OrderStatus, Order } from '@/types';
import { formatDate, cn } from '@/utils';
import { Plus, Briefcase, MapPin, ChevronDown, Check } from 'lucide-react';
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
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [barrioFilter, setBarrioFilter] = useState('ALL');

  const availableBarrios = useMemo(
    () =>
      [
        ...new Set(
          orders
            .filter((o) => o.estado === OrderStatus.ABIERTO)
            .map((o) => o.barrio)
            .filter(Boolean),
        ),
      ].sort() as string[],
    [orders],
  );

  const visible = orders.filter(
    (o) =>
      o.estado === OrderStatus.ABIERTO &&
      (categoryFilter === 'ALL' || o.categoriaId === categoryFilter) &&
      (barrioFilter === 'ALL' || o.barrio === barrioFilter),
  );

  const hasFilters = categoryFilter !== 'ALL' || barrioFilter !== 'ALL';

  const clearFilters = () => {
    setCategoryFilter('ALL');
    setBarrioFilter('ALL');
  };

  return (
    <div className="space-y-5 pt-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Feed de Pedidos</h1>
            <p className="text-gray-500 text-sm">Encuentra nuevas oportunidades de trabajo</p>
          </div>
          <BarrioSelector
            barrios={availableBarrios}
            value={barrioFilter}
            onChange={setBarrioFilter}
          />
        </div>

        <HorizontalScroll>
          <Button
            size="sm"
            variant={categoryFilter === 'ALL' ? 'primary' : 'outline'}
            onClick={() => setCategoryFilter('ALL')}
            className="rounded-full flex-shrink-0"
          >
            Todos
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={categoryFilter === cat.id ? 'primary' : 'outline'}
              onClick={() => setCategoryFilter(cat.id)}
              className="rounded-full flex-shrink-0 whitespace-nowrap"
              leftIcon={<CategoryIcon name={cat.icono} size={16} />}
            >
              {cat.nombre}
            </Button>
          ))}
        </HorizontalScroll>

        {hasFilters && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {visible.length} resultado{visible.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearFilters}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.length > 0 ? (
          visible.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="col-span-full py-12 text-center space-y-2">
            <p className="text-gray-500">
              {hasFilters
                ? 'No hay pedidos con los filtros seleccionados.'
                : 'No hay pedidos disponibles.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface BarrioSelectorProps {
  barrios: string[];
  value: string;
  onChange: (barrio: string) => void;
}

function BarrioSelector({ barrios, value, onChange }: BarrioSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const filtered = barrios.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase()),
  );

  const isActive = value !== 'ALL';

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap',
          isActive
            ? 'border-teal-600 bg-teal-50 text-teal-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
        )}
      >
        <MapPin size={14} />
        <span className="max-w-[110px] truncate">{isActive ? value : 'Barrio'}</span>
        <ChevronDown
          size={14}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 bg-white border border-gray-200 rounded-2xl shadow-lg w-56 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar barrio..."
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            <li>
              <button
                onClick={() => { onChange('ALL'); setOpen(false); setSearch(''); }}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2',
                  !isActive ? 'text-teal-700 font-semibold' : 'text-gray-700',
                )}
              >
                {!isActive && <Check size={14} className="flex-shrink-0" />}
                <span className={!isActive ? '' : 'ml-[18px]'}>Todos los barrios</span>
              </button>
            </li>
            {filtered.map((barrio) => (
              <li key={barrio}>
                <button
                  onClick={() => { onChange(barrio); setOpen(false); setSearch(''); }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2',
                    value === barrio ? 'text-teal-700 font-semibold' : 'text-gray-700',
                  )}
                >
                  {value === barrio ? (
                    <Check size={14} className="flex-shrink-0" />
                  ) : (
                    <span className="w-[14px] flex-shrink-0" />
                  )}
                  {barrio}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">
                Sin resultados
              </li>
            )}
          </ul>
        </div>
      )}
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

        <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-[10px] sm:text-xs">
          <div className="flex flex-col">
            <span className="text-gray-400 uppercase font-medium">Publicado</span>
            <span className="text-gray-900">{formatDate(order.createdAt)}</span>
          </div>
          <span className="text-teal-700 font-semibold text-xs hover:text-teal-800">
            Ver detalle →
          </span>
        </div>
      </Card>
    </Link>
  );
}
