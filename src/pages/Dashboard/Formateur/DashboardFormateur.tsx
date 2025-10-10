import React from 'react';
import { Layout } from '@/components/Layout/Layout';
import { FormateurHome } from './FormateurHome';

/**
 * Ce composant sert de point d'entrée pour le tableau de bord du formateur.
 * Le routage principal est maintenant géré dans AppRouter.
 */
export const DashboardFormateur: React.FC = () => {
  return (
    <Layout userRole="formateur">
      <FormateurHome />
    </Layout>
  );
};