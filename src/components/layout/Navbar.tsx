import { Link, NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Role } from '@/types';
import { cn } from '@/utils';

const NAV_LINKS: Record<Role, { to: string; label: string; end?: boolean }[]> = {
  [Role.CLIENTE]: [
    { to: '/', label: 'Mis Pedidos', end: true },
    { to: '/contact', label: 'Área de contacto' },
    { to: '/profile', label: 'Perfil' },
  ],
  [Role.ESPECIALISTA]: [
    { to: '/', label: 'Feed', end: true },
    { to: '/my-jobs', label: 'Mis Trabajos' },
    { to: '/profile', label: 'Perfil' },
  ],
  [Role.ADMIN]: [
    { to: '/admin', label: 'Panel' },
    { to: '/profile', label: 'Perfil' },
  ],
};

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const links = user?.rol ? NAV_LINKS[user.rol] : [];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between shadow-sm">
      {/* Left: logo + nav links */}
      <div className="flex items-center gap-1">
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0 mr-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Mi Chamba</span>
        </Link>

        {isAuthenticated && links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                'hidden md:block px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Right: user info + logout */}
      {isAuthenticated ? (
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link
            to="/profile"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Avatar nombre={user?.nombre || ''} apellido={user?.apellido} size="sm" />
            <span className="hidden md:block font-medium text-sm">{user?.nombre}</span>
          </Link>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Ingresar
        </Link>
      )}
    </nav>
  );
}
