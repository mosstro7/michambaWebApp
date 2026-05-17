import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createOrder } from '@/lib/api';
import { BARRIOS } from '@/data/mockData';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Check } from 'lucide-react';

interface Category {
  id: string;
  nombre: string;
}

export function NewOrder() {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('No se pudieron cargar las categorías'))
      .finally(() => setIsLoadingCats(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await createOrder(titulo, descripcion, categoriaId, barrio);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al publicar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-4 pb-12">
      <div className="flex items-center mb-6">
        <button
          onClick={() => (step === 1 ? navigate(-1) : setStep(1))}
          className="p-2 -ml-2 text-gray-500"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">Publicar Pedido</h1>
      </div>

      <div className="mb-8 flex justify-between px-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s === step
                  ? 'bg-teal-700 text-white'
                  : s < step
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s < step ? <Check size={16} /> : s}
            </div>
            <div className="h-1 w-full bg-gray-200 mt-2 relative overflow-hidden">
              {s <= step && (
                <div
                  className="absolute inset-0 bg-teal-700 transition-all duration-300"
                  style={{ width: s === step ? '50%' : '100%' }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold px-2">¿Qué necesitas arreglar?</h2>

            {isLoadingCats ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoriaId(cat.id);
                      setStep(2);
                    }}
                    className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                      categoriaId === cat.id
                        ? 'border-teal-700 bg-teal-50 text-teal-700'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <span className="text-sm font-medium">{cat.nombre}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold">Cuéntanos más detalles</h2>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del pedido
                </label>
                <input
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Reparación de gotera en baño"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del problema
                </label>
                <textarea
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Tengo una gotera en el baño principal que moja el piso..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tu barrio
                </label>
                <select
                  required
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                >
                  <option value="">Selecciona tu barrio</option>
                  {BARRIOS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={!titulo || !descripcion || !barrio}
            >
              Publicar Pedido
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
