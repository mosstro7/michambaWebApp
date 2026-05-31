import { NavLink } from 'react-router-dom';
import { Home, ListChecks, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types';
import { cn } from '@/utils';

const TAB_CONFIG = {
  [Role.CLIENTE]: [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ],
  [Role.ESPECIALISTA]: [
    { to: '/', icon: ListChecks, label: 'Feed' },
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
          end={tab.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
              isActive ? 'text-blue-600' : 'text-gray-400',
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
