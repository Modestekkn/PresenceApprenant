import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { OfflineBanner } from '../UI/OfflineBanner';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'superadmin' | 'formateur';
}

export const Layout: React.FC<LayoutProps> = ({ children, userRole }) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-alt)] transition-colors">
      <OfflineBanner />
      {/* Navbar en haut */}
      <Navbar />
      
      {/* Contenu principal avec sidebar */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar userRole={userRole} />
        
        {/* Contenu principal */}
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};