import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';

// Import des pages Formateur (à créer)
import { FormateurHome } from './FormateurHome';
import { MarquerPresence } from './MarquerPresence';
import { SoumettreRapport } from './SoumettreRapport';

export const DashboardFormateur: React.FC = () => {
  return (
    <Layout userRole="formateur">
      <Routes>
        <Route path="/" element={<FormateurHome />} />
        <Route path="/presence" element={<MarquerPresence />} />
        <Route path="/rapport" element={<SoumettreRapport />} />
        <Route path="*" element={<Navigate to="/dashboard/formateur" replace />} />
      </Routes>
    </Layout>
  );
};