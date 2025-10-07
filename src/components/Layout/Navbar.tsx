import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../UI/Button';
import { User, LogOut, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => logout();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-white/90 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo + titre */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <User className="w-6 h-6 text-gray-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Système de Présence
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-8">
          <button
            className="p-2 text-gray-400 bg-blue-50 hover:text-gray-600 transition-colors rounded-full focus-ring"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </span>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2 backdrop-blur-sm"
          >
            <LogOut className="w-5 h-5 text-white" />
            <span className='text-white text-sm'>Déconnexion</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};