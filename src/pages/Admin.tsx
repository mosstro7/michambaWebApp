import { useEffect, useState } from 'react';
import { getUsuarios, deleteUsuario } from '@/lib/api';
import { formatDate } from '@/utils';
import { Trash2 } from 'lucide-react';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  createdAt: string;
}

const ROL_COLORS: Record<string, string> = {
  CLIENTE: 'bg-blue-100 text-blue-700',
  ESPECIALISTA: 'bg-teal-100 text-teal-700',
  ADMIN: 'bg-purple-100 text-purple-700',
};

export function Admin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    getUsuarios()
      .then(setUsuarios)
      .catch((err) => setError(err.message || 'Error al cargar usuarios'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleteError('');
    setDeleting(id);
    try {
      await deleteUsuario(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      setConfirmId(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Error al eliminar usuario');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-gray-500 text-sm">Gestión de usuarios registrados</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {deleteError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {deleteError}
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {usuarios.length} usuarios
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Rol</th>
                  <th className="px-4 py-3 text-left font-semibold">Registro</th>
                  <th className="px-4 py-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                          ROL_COLORS[u.rol] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {confirmId === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-500">¿Confirmar?</span>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deleting === u.id}
                            className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deleting === u.id ? 'Eliminando...' : 'Sí, eliminar'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            disabled={deleting === u.id}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(u.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
