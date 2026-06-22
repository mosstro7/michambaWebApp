import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { getReports, toggleReportRevisado } from '@/lib/api';
import type { Report } from '@/lib/api';
import { formatDateTime } from '@/utils';

const ROL_COLORS: Record<string, string> = {
  CLIENTE: 'bg-blue-100 text-blue-700',
  ESPECIALISTA: 'bg-teal-100 text-teal-700',
  ADMIN: 'bg-purple-100 text-purple-700',
};

function RolBadge({ rol }: { rol: string }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${ROL_COLORS[rol] ?? 'bg-gray-100 text-gray-600'}`}>
      {rol}
    </span>
  );
}

export function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    getReports()
      .then(setReports)
      .catch((err: Error) => setError(err.message || 'Error al cargar reportes'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggleRevisado = async (id: string) => {
    setToggling(id);
    try {
      const updated = await toggleReportRevisado(id);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, revisado: updated.revisado } : r)));
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-gray-500 text-sm">Denuncias enviadas por usuarios</p>
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

      {!isLoading && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {reports.length} reporte{reports.length !== 1 ? 's' : ''}
          </div>

          {reports.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-gray-400">No hay reportes todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                    <th className="px-4 py-3 text-left font-semibold">Reportante</th>
                    <th className="px-4 py-3 text-left font-semibold">Reportado</th>
                    <th className="px-4 py-3 text-left font-semibold">Motivo</th>
                    <th className="px-4 py-3 text-left font-semibold">Pedido</th>
                    <th className="px-4 py-3 text-center font-semibold">Revisado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.map((r) => (
                    <tr
                      key={r.id}
                      className={`hover:bg-gray-50 transition-colors ${r.revisado ? 'opacity-60' : ''}`}
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDateTime(r.creadoEn)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-gray-900">
                            {r.reportante.nombre} {r.reportante.apellido}
                          </span>
                          <RolBadge rol={r.reportante.rol} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-gray-900">
                            {r.reportado.nombre} {r.reportado.apellido}
                          </span>
                          <RolBadge rol={r.reportado.rol} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs">
                        <span className="line-clamp-2">{r.motivo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/order/${r.pedido.id}`}
                          className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 hover:underline"
                        >
                          <span className="truncate max-w-[140px]">{r.pedido.titulo}</span>
                          <ExternalLink size={12} className="flex-shrink-0" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleRevisado(r.id)}
                          disabled={toggling === r.id}
                          className="inline-flex items-center justify-center text-gray-400 hover:text-teal-600 disabled:opacity-40 transition-colors"
                          title={r.revisado ? 'Marcar como no revisado' : 'Marcar como revisado'}
                        >
                          {toggling === r.id ? (
                            <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                          ) : r.revisado ? (
                            <CheckCircle2 size={20} className="text-teal-600" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
