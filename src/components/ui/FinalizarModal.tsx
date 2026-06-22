import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from './Button';
import { finalizarPedido } from '@/lib/api';
import { cn } from '@/utils';

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5"
        >
          <Star
            size={36}
            className={cn(
              'transition-colors',
              n <= (hovered || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200',
            )}
          />
        </button>
      ))}
    </div>
  );
}

const LABEL = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

interface FinalizarModalProps {
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function FinalizarModal({ orderId, onClose, onSuccess }: FinalizarModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puntuacion || !comentario.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      await finalizarPedido(orderId, puntuacion, comentario.trim());
      onSuccess();
    } catch (err: any) {
      const msg =
        err.status === 400 ? 'El pedido no está en progreso.' :
        err.status === 403 ? 'No tenés permiso para finalizar este pedido.' :
        err.message || 'Error al finalizar el pedido';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">
            {step === 1 ? 'Finalizar trabajo' : 'Calificar al especialista'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-5">
            <p className="text-gray-700">¿Confirmás que el trabajo fue completado?</p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                No, volver
              </Button>
              <Button type="button" className="flex-1" onClick={() => setStep(2)}>
                Sí, continuar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                ¿Cómo calificás el trabajo?
              </label>
              <StarRating value={puntuacion} onChange={setPuntuacion} />
              {puntuacion > 0 && (
                <p className="text-xs text-center text-gray-400">{LABEL[puntuacion]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentario
              </label>
              <textarea
                required
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Contá cómo fue tu experiencia con el especialista..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent min-h-[100px] text-sm"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                Atrás
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={isSubmitting}
                disabled={!puntuacion || !comentario.trim()}
              >
                Enviar calificación
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
