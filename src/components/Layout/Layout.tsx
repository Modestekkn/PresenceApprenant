import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { OfflineBanner } from '../UI/OfflineBanner';
import { clsx } from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'superadmin' | 'formateur';
}

export const Layout: React.FC<LayoutProps> = ({ children, userRole }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineBanner />
      <Navbar />
      <Sidebar userRole={userRole} />
      
      {/* Contenu principal */}
      <main className={clsx(
        'pt-16 transition-all duration-300 ease-in-out',
        'lg:ml-64' // Marge à gauche pour la sidebar sur les grands écrans
      )}>
        <div className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};