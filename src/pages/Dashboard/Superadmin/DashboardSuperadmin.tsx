import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';

// Import des pages Superadmin (à créer)
import { SuperadminHome } from './SuperadminHome';
import { ManageFormateurs } from './ManageFormateurs';
import { ManageApprenants } from './ManageApprenants';
import { ManageFormations } from './ManageFormations';
import { ManageSessions } from './ManageSessions';
import { ViewRapports } from './ViewRapports';

export const DashboardSuperadmin: React.FC = () => {
  return (
    <Layout userRole="superadmin">
      <Routes>
        <Route path="/" element={<SuperadminHome />} />
        <Route path="/formateurs" element={<ManageFormateurs />} />
        <Route path="/apprenants" element={<ManageApprenants />} />
        <Route path="/formations" element={<ManageFormations />} />
        <Route path="/sessions" element={<ManageSessions />} />
        <Route path="/rapports" element={<ViewRapports />} />
        <Route path="*" element={<Navigate to="/dashboard/superadmin" replace />} />
      </Routes>
    </Layout>
  );
};