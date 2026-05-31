import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '@/lib/api';
import { OrderStatus, OrderWithSpecialist } from '@/types';
import { formatDate } from '@/utils';
import { MapPin, Calendar, User, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export function ContactArea() {
  const [orders, setOrders] = useState<OrderWithSpecialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders()
      .then((data) =>
        setOrders(
          (data as OrderWithSpecialist[]).filter(
            (o) => o.estado === OrderStatus.EN_PROGRESO,
          ),
        ),
      )
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
        <p className="text-gray-500 text-sm">Pedidos en progreso con un especialista asignado</p>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-gray-500 font-medium">No tenés pedidos en progreso</p>
          <p className="text-sm text-gray-400">
            Aquí verás tus pedidos cuando aceptes una propuesta.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <ContactCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContactCard({ order }: { order: OrderWithSpecialist }) {
  const especialista = order.propuestaAceptada?.especialista;
  const nombreEspecialista = especialista
    ? `${especialista.nombre} ${especialista.apellido}`.trim()
    : null;

  return (
    <Link to={`/order/${order.id}`}>
      <Card className="hover:border-teal-500 transition-colors">
        <div className="flex items-start gap-3">
          {especialista ? (
            <Avatar
              nombre={especialista.nombre}
              apellido={especialista.apellido}
              size="md"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-gray-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{order.titulo}</h3>
            {nombreEspecialista ? (
              <p className="text-sm text-teal-700 font-medium">{nombreEspecialista}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Especialista asignado</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {order.barrio}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <span className="flex-shrink-0 text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full uppercase">
            En progreso
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-sm text-teal-600 font-medium">
          <span>Ver propuestas y detalles</span>
          <ArrowRight size={16} />
        </div>
      </Card>
    </Link>
  );
}
