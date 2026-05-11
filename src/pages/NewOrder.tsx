import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { CATEGORIES, BARRIOS } from '@/data/mockData';
import { OrderStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ChevronLeft, Check } from 'lucide-react';

export function NewOrder() {
  const [step, setStep] = useState(1);
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addOrder } = useAppStore();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newOrder = {
      id: Math.random().toString(36).substr(2, 9),
      clienteId: user?.id || '1',
      categoriaId,
      descripcion,
      barrio,
      estado: OrderStatus.ABIERTO,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      addOrder(newOrder);
      setIsSubmitting(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto pt-4 pb-12">
      <div className="flex items-center mb-6">
        <button onClick={() => step === 1 ? navigate(-1) : handleBack()} className="p-2 -ml-2 text-gray-500">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">Publicar Pedido</h1>
      </div>

      <div className="mb-8 flex justify-between px-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s < step ? <Check size={16} /> : s}
            </div>
            <div className="h-1 w-full bg-gray-200 mt-2 relative overflow-hidden">
               {s <= step && <div className="absolute inset-0 bg-blue-600 transition-all duration-300" style={{ width: s === step ? '50%' : '100%' }} />}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold px-2">¿Qué necesitas arreglar?</h2>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoriaId(cat.id);
                    handleNext();
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    categoriaId === cat.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <CategoryIcon name={cat.icono} size={32} className="mb-2" />
                  <span className="text-sm font-medium">{cat.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold">Cuéntanos más detalles</h2>
            
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del problema</label>
                <textarea
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Tengo una gotera en el baño principal..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tu barrio</label>
                <select
                  required
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona tu barrio</option>
                  {BARRIOS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!descripcion || !barrio}>
              Publicar Pedido
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
