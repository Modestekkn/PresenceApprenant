import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../hooks/useSidebar';
import { Button } from '../UI/Button';
import { User, LogOut, Bell, Menu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();

  const handleLogout = () => logout();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Côté gauche : Bouton de menu (mobile) + Logo + Titre */}
        <div className="flex items-center">
          {/* Bouton pour afficher/cacher le menu latéral sur mobile */}
          <button
            onClick={toggleSidebar}
            className="p-2 mr-2 text-gray-600 rounded-md hover:bg-gray-100 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo et Titre */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-800">
              Système de Présence
            </h1>
          </div>
        </div>

        {/* Côté droit : Actions utilisateur */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
              {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-800">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="hidden sm:block">
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
          <div className="sm:hidden">
             <Button
              variant="danger"
              size="icon"
              onClick={handleLogout}
              aria-label="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};