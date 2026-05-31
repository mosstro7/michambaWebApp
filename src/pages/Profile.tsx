import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Phone, MapPin, ShieldCheck, ChevronRight, LogOut, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 pt-4 pb-20">
      <h1 className="text-2xl font-bold">Perfil</h1>

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

      <section className="space-y-2">
        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Teléfono</p>
              <p className="font-medium">{user.telefono}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Editar</Button>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Barrio</p>
              <p className="font-medium">{user.barrio}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Editar</Button>
        </Card>
      </section>

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

function MenuItem({ icon, label, onClick, color }: { icon: any, label: string, onClick?: () => void, color?: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-400">
          {icon}
        </div>
        <span className={`font-medium ${color || 'text-gray-700'}`}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </button>
  );
}
