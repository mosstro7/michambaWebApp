import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProposals } from '@/lib/api';
import { ProposalStatus, ProposalWithOrder } from '@/types';
import { formatDate, formatCurrency } from '@/utils';
import { MapPin, Calendar, User, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export function MyJobs() {
  const [jobs, setJobs] = useState<ProposalWithOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyProposals()
      .then((data) =>
        setJobs(data.filter((p) => p.estado === ProposalStatus.ACEPTADA)),
      )
      .catch((err) => setError(err.message || 'Error al cargar trabajos'))
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
        <h1 className="text-2xl font-bold">Mis Trabajos</h1>
        <p className="text-gray-500 text-sm">Propuestas aceptadas por clientes</p>
      </div>

      {jobs.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-gray-500 font-medium">No tenés trabajos activos</p>
          <p className="text-sm text-gray-400">
            Aquí verás tus propuestas cuando un cliente te elija.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: ProposalWithOrder }) {
  const pedido = job.pedido;
  const cliente = pedido?.cliente;
  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido}`.trim()
    : null;

  return (
    <Link to={`/order/${job.pedidoId}`}>
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
            <h3 className="font-bold text-gray-900 truncate">
              {pedido?.titulo || 'Pedido'}
            </h3>
            {nombreCliente ? (
              <p className="text-sm text-teal-700 font-medium">{nombreCliente}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Cliente</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
              {pedido?.barrio && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {pedido.barrio}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {formatDate(job.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-1 rounded-full uppercase block mb-1">
              Aceptada
            </span>
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(job.precioOferta)}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
          <span>Ver detalles del pedido</span>
          <ArrowRight size={16} className="text-teal-600" />
        </div>
      </Card>
    </Link>
  );
}
