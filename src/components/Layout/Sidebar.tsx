import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  CheckCircle,
  ClipboardList
} from 'lucide-react';

interface SidebarProps {
  userRole: 'superadmin' | 'formateur';
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  // Menus pour le superadmin
  const superadminMenus = [
    { path: '/dashboard/superadmin', icon: Home, label: 'Tableau de bord' },
    { path: '/dashboard/superadmin/formateurs', icon: Users, label: 'Formateurs' },
    { path: '/dashboard/superadmin/apprenants', icon: GraduationCap, label: 'Apprenants' },
    { path: '/dashboard/superadmin/formations', icon: BookOpen, label: 'Formations' },
    { path: '/dashboard/superadmin/sessions', icon: Calendar, label: 'Sessions' },
    { path: '/dashboard/superadmin/rapports', icon: FileText, label: 'Rapports' },
  ];

  // Menus pour le formateur
  const formateurMenus = [
    { path: '/dashboard/formateur', icon: Home, label: 'Tableau de bord' },
    { path: '/dashboard/formateur/presence', icon: CheckCircle, label: 'Marquer présence' },
    { path: '/dashboard/formateur/rapport', icon: ClipboardList, label: 'Soumettre rapport' },
  ];

  const menus = userRole === 'superadmin' ? superadminMenus : formateurMenus;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
              end={menu.path.endsWith('/superadmin') || menu.path.endsWith('/formateur')}
            >
              <menu.icon className="w-5 h-5 mr-3" />
              {menu.label}
            </NavLink>
          ))}
        </nav>

        {/* Information en bas */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Version 1.0.0</p>
            <p>© 2025 Système de Présence</p>
          </div>
        </div>
      </div>
    </aside>
  );
};