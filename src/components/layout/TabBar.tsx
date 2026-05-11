import { NavLink } from 'react-router-dom';
import { Home, ListChecks, MessageSquare, User, PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types';
import { cn } from '@/utils';

export function TabBar() {
  const { user } = useAuthStore();
  const isCliente = user?.rol === Role.CLIENTE;

  const tabs = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: isCliente ? '/my-orders' : '/feed', icon: ListChecks, label: isCliente ? 'Mis Pedidos' : 'Feed' },
    { to: '/messages', icon: MessageSquare, label: 'Mensajes' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden flex items-center justify-around h-20 px-2 pb-safe">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-blue-600" : "text-gray-400"
            )
          }
        >
          <tab.icon size={22} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </NavLink>
      ))}

      {isCliente && (
        <NavLink
          to="/new-order"
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-gray-50 active:scale-95 transition-transform"
        >
          <PlusCircle size={32} />
        </NavLink>
      )}
    </div>
  );
}
