import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Role } from '@/types';
import { Mail, Lock, User as UserIcon, Briefcase } from 'lucide-react';

export function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Role>(Role.CLIENTE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(nombre, email, password, rol);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Creá tu cuenta en Mi Chamba
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-teal-700 hover:text-teal-600"
          >
            Iniciá sesión
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cómo vas a usar Mi Chamba?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRol(Role.CLIENTE)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                    rol === Role.CLIENTE
                      ? 'border-teal-700 bg-teal-50 text-teal-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <UserIcon size={24} />
                  <span className="text-sm font-semibold">Cliente</span>
                  <span className="text-xs text-center leading-tight opacity-70">
                    Busco especialistas
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRol(Role.ESPECIALISTA)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                    rol === Role.ESPECIALISTA
                      ? 'border-teal-700 bg-teal-50 text-teal-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Briefcase size={24} />
                  <span className="text-sm font-semibold">Especialista</span>
                  <span className="text-xs text-center leading-tight opacity-70">
                    Ofrezco servicios
                  </span>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Crear cuenta
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
