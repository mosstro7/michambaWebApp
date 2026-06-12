import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ListChecks, User, LayoutDashboard, MessageCircle, Briefcase } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types';
import { cn } from '@/utils';

type TabItem = { to: string; icon: React.ComponentType<{ size?: number }>; label: string; end?: boolean };

const TAB_CONFIG: Record<Role, TabItem[]> = {
  [Role.CLIENTE]: [
    { to: '/', icon: Home, label: 'Mis Pedidos', end: true },
    { to: '/contact', icon: MessageCircle, label: 'Contacto' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ],
  [Role.ESPECIALISTA]: [
    { to: '/', icon: ListChecks, label: 'Feed', end: true },
    { to: '/my-jobs', icon: Briefcase, label: 'Mis Trabajos' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ],
  [Role.ADMIN]: [
    { to: '/admin', icon: LayoutDashboard, label: 'Panel' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ],
};

export function TabBar() {
  const { user } = useAuthStore();
  const tabs = user?.rol ? (TAB_CONFIG[user.rol] ?? []) : [];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden flex items-center justify-around h-20 px-2 pb-safe">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
              isActive ? 'text-teal-700 font-bold' : 'text-gray-400',
            )
          }
        >
          <tab.icon size={22} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
