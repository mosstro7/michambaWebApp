import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getMe, updateMe, getPerfilEspecialista } from '@/lib/api';
import type { Me, Calificacion } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/utils';
import { Role } from '@/types';
import {
  Phone, MapPin, ShieldCheck, LogOut, Settings, ChevronRight,
  Star, Briefcase, Wrench, FileText,
} from 'lucide-react';

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

interface FieldCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onSave: (val: string) => Promise<void>;
  textarea?: boolean;
  placeholder?: string;
}

function FieldCard({ icon, label, value, onSave, textarea = false, placeholder }: FieldCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (trimmed === value.trim()) { setEditing(false); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => { setEditing(false); setDraft(value); setError(''); };

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-500 flex-shrink-0">{icon}</div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{label}</p>
            {!editing && (
              <p className="font-medium mt-0.5 break-words">
                {value || <span className="text-gray-400 italic text-sm font-normal">Sin completar</span>}
              </p>
            )}
          </div>
        </div>
        {!editing && (
          <Button variant="ghost" size="sm" className="flex-shrink-0 ml-2" onClick={() => setEditing(true)}>
            Editar
          </Button>
        )}
      </div>
      {editing && (
        <div className="space-y-2 pl-[52px]">
          {textarea ? (
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent min-h-[80px]"
            />
          ) : (
            <input
              autoFocus
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={cancel} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" isLoading={saving} onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [promedio, setPromedio] = useState<number | null>(null);
  const [totalTrabajos, setTotalTrabajos] = useState(0);

  const isEspecialista = user?.rol === Role.ESPECIALISTA;

  useEffect(() => {
    getMe()
      .then(setProfile)
      .catch((err: Error) => setLoadError(err.message || 'Error al cargar el perfil'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isEspecialista || !user?.id) return;
    getPerfilEspecialista(user.id)
      .then((perfil) => {
        setCalificaciones(perfil.calificaciones);
        setPromedio(perfil.promedioPuntuacion);
        setTotalTrabajos(perfil.totalTrabajosFinalizados);
      })
      .catch(() => {});
  }, [isEspecialista, user?.id]);

  const save = async (field: string, value: string) => {
    await updateMe({ [field]: value });
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="space-y-6 pt-4 pb-20">
      <h1 className="text-2xl font-bold">Perfil</h1>

      {/* Avatar + nombre */}
      <section className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar
            nombre={user.nombre}
            apellido={user.apellido}
            size="lg"
            className="border-4 border-white shadow-md"
          />
          {user.verificado && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
              <ShieldCheck size={16} />
            </div>
          )}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{user.nombre} {user.apellido}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
      </section>

      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {loadError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {loadError}
        </div>
      )}

      {profile && (
        <>
          {/* Datos personales */}
          <section className="space-y-2">
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest ml-1">
              Datos personales
            </h3>
            <FieldCard
              icon={<Phone size={20} />}
              label="Teléfono"
              value={profile.telefono ?? ''}
              onSave={(v) => save('telefono', v)}
              placeholder="Ej: +54 11 1234-5678"
            />
            <FieldCard
              icon={<MapPin size={20} />}
              label="Barrio"
              value={profile.barrio ?? ''}
              onSave={(v) => save('barrio', v)}
              placeholder="Ej: Palermo"
            />
          </section>

          {/* Datos profesionales (solo ESPECIALISTA) */}
          {isEspecialista && (
            <section className="space-y-2">
              <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest ml-1">
                Datos profesionales
              </h3>
              <FieldCard
                icon={<Briefcase size={20} />}
                label="Especialidad"
                value={profile.especialidad ?? ''}
                onSave={(v) => save('especialidad', v)}
                placeholder="Ej: Plomería, Electricidad..."
              />
              <FieldCard
                icon={<Wrench size={20} />}
                label="Experiencia"
                value={profile.experiencia ?? ''}
                onSave={(v) => save('experiencia', v)}
                placeholder="Ej: 5 años en instalaciones domiciliarias"
              />
              <FieldCard
                icon={<FileText size={20} />}
                label="Descripción"
                value={profile.descripcion ?? ''}
                onSave={(v) => save('descripcion', v)}
                textarea
                placeholder="Contá brevemente tu perfil profesional..."
              />
            </section>
          )}

          {/* Calificaciones recibidas (solo ESPECIALISTA) */}
          {isEspecialista && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest ml-1">
                  Mis calificaciones
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">{totalTrabajos}</span>
                  <span>trabajos</span>
                  {promedio !== null && (
                    <>
                      <span className="text-gray-300">·</span>
                      <StarDisplay value={promedio} />
                      <span className="font-semibold text-gray-700">{promedio.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </div>
              {calificaciones.length > 0 ? (
                <div className="space-y-2">
                  {calificaciones.map((c, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <StarDisplay value={c.puntuacion} />
                        <span className="text-xs text-gray-400">{formatDate(c.creadoEn)}</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">"{c.comentario}"</p>
                      <p className="text-xs text-gray-500 font-medium">
                        — {c.cliente.nombre} {c.cliente.apellido}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 px-4 py-8 text-center">
                  <p className="text-sm text-gray-400">Aún no tenés calificaciones.</p>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Ajustes */}
      <section className="space-y-3">
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest ml-1">Ajustes</h3>
        <Card className="divide-y divide-gray-100 p-0">
          <MenuItem icon={<Settings size={20} />} label="Configuración de cuenta" />
          <MenuItem
            icon={<LogOut size={20} className="text-red-500" />}
            label="Cerrar sesión"
            onClick={handleLogout}
            color="text-red-500"
          />
        </Card>
      </section>

      <div className="text-center text-gray-400 text-[10px] mt-8">
        Mi Chamba v0.1.0 (MVP)
      </div>
    </div>
  );
}

function MenuItem({
  icon, label, onClick, color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-400">{icon}</div>
        <span className={`font-medium ${color || 'text-gray-700'}`}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </button>
  );
}
