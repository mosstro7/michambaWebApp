import { Link } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">M</span>
        </div>
        <span className="font-bold text-xl tracking-tight">Mi Chamba</span>
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center space-x-4">
          <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.nombre} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-gray-400" />
              )}
            </div>
            <span className="hidden md:block font-medium">{user?.nombre}</span>
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
