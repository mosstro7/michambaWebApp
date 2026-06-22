import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPerfilEspecialista } from '@/lib/api';
import type { PerfilEspecialista } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils';
import { ChevronLeft, Star, Briefcase } from 'lucide-react';

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={16}
          className={
            n <= Math.round(value)
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-200 fill-gray-200'
          }
        />
      ))}
    </div>
  );
}

export function EspecialistaProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilEspecialista | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getPerfilEspecialista(id)
      .then(setPerfil)
      .catch((err: Error) => setError(err.message || 'No se pudo cargar el perfil'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">{error || 'Perfil no encontrado'}</h2>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 -ml-1 p-1 text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft size={22} />
        <span className="text-sm font-medium">Volver</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center gap-4">
        <Avatar nombre={perfil.nombre} apellido={perfil.apellido} size="lg" />
        <div className="w-full">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            {perfil.nombre} {perfil.apellido}
          </h1>
          <div className="flex justify-center mt-1">
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase">
              Especialista
            </span>
          </div>
          {(perfil.especialidad || perfil.experiencia || perfil.descripcion) && (
            <div className="mt-4 space-y-2 text-left">
              {perfil.especialidad && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Especialidad</p>
                  <p className="text-sm text-gray-700">{perfil.especialidad}</p>
                </div>
              )}
              {perfil.experiencia && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Experiencia</p>
                  <p className="text-sm text-gray-700">{perfil.experiencia}</p>
                </div>
              )}
              {perfil.descripcion && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Descripción</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{perfil.descripcion}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-8 pt-3 border-t border-gray-100 w-full justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1.5">
              <Briefcase size={14} className="text-gray-400" />
              <span className="text-xl font-bold text-gray-900">
                {perfil.totalTrabajosFinalizados}
              </span>
            </div>
            <span className="text-xs text-gray-400">trabajos</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            {perfil.promedioPuntuacion !== null ? (
              <>
                <div className="flex items-center gap-1.5">
                  <StarDisplay value={perfil.promedioPuntuacion} />
                  <span className="text-xl font-bold text-gray-900">
                    {perfil.promedioPuntuacion.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {perfil.calificaciones.length}{' '}
                  calificacion{perfil.calificaciones.length !== 1 ? 'es' : ''}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400">Sin calificaciones aún</span>
            )}
          </div>
        </div>
      </div>

      {/* Reseñas */}
      {perfil.calificaciones.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-bold text-lg">Calificaciones</h2>
          {perfil.calificaciones.map((c, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <StarDisplay value={c.puntuacion} />
                <span className="text-xs text-gray-400">{formatDate(c.creadoEn)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                "{c.comentario}"
              </p>
              <p className="text-xs font-medium text-gray-500">
                — {c.cliente.nombre} {c.cliente.apellido}
              </p>
            </div>
          ))}
        </section>
      ) : (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">
            Este especialista aún no tiene calificaciones.
          </p>
        </div>
      )}
    </div>
  );
}
