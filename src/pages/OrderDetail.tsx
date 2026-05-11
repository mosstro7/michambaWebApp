import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { CATEGORIES } from '@/data/mockData';
import { OrderStatus, Role } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { formatCurrency, formatDate } from '@/utils';
import { ChevronLeft, MapPin, Calendar, Clock, MessageCircle, Star } from 'lucide-react';

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, proposals } = useAppStore();
  const { user } = useAuthStore();
  
  const order = orders.find(o => o.id === id);
  const orderProposals = proposals.filter(p => p.pedidoId === id);
  
  if (!order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Pedido no encontrado</h2>
        <Button onClick={() => navigate('/')} className="mt-4">Volver al inicio</Button>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.id === order.categoriaId);
  const isOwner = user?.id === order.clienteId;
  const isEspecialista = user?.rol === Role.ESPECIALISTA;

  return (
    <div className="space-y-6 pt-4 pb-20">
      <div className="flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">Detalle del Pedido</h1>
      </div>

      <Card className="border-l-4 border-l-blue-600">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {category && <CategoryIcon name={category.icono} size={24} />}
          </div>
          <div>
            <h2 className="text-lg font-bold">{category?.nombre}</h2>
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <span className="flex items-center"><MapPin size={12} className="mr-1" /> {order.barrio}</span>
              <span className="flex items-center"><Calendar size={12} className="mr-1" /> {formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
          {order.descripcion}
        </p>
      </Card>

      {isOwner && (
        <section className="space-y-4">
          <h3 className="font-bold text-lg">Propuestas Recibidas ({orderProposals.length})</h3>
          {orderProposals.length > 0 ? (
            <div className="space-y-3">
              {orderProposals.map(proposal => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">Aún no has recibido propuestas.</p>
              <p className="text-xs text-gray-400 mt-1">Te notificaremos cuando alguien se postule.</p>
            </div>
          )}
        </section>
      )}

      {isEspecialista && order.estado === OrderStatus.ABIERTO && (
        <div className="sticky bottom-4 mx-auto w-full md:relative bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <Button className="w-full" onClick={() => alert('¡Funcionalidad en desarrollo!')}>
            Enviar mi Propuesta
          </Button>
        </div>
      )}
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: any }) {
  // Mock specialist info
  const specialist = {
    nombre: 'Carlos G.',
    rating: 4.8,
    reviews: 24,
    avatar: 'https://i.pravatar.cc/150?u=carlos'
  };

  return (
    <Card className="hover:border-blue-400 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img src={specialist.avatar} alt={specialist.nombre} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
          <div>
            <h4 className="font-bold">{specialist.nombre}</h4>
            <div className="flex items-center text-xs text-yellow-500 font-bold">
              <Star size={12} fill="currentColor" className="mr-1" />
              {specialist.rating} <span className="text-gray-400 font-normal ml-1">({specialist.reviews} reseñas)</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-400 block uppercase font-bold text-[10px]">Oferta</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(proposal.precioOferta)}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 italic">
        "{proposal.descripcion}"
      </p>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" className="flex-1 rounded-lg">
          Aceptar
        </Button>
        <Button variant="outline" size="sm" className="rounded-lg shadow-none">
          Perfil
        </Button>
        <Button variant="secondary" size="sm" className="rounded-lg shadow-none px-3">
          <MessageCircle size={18} />
        </Button>
      </div>
    </Card>
  );
}
