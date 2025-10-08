import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PrivateRoute } from './PrivateRoute';
import { Login } from '../pages/Login';

// Import des dashboards
import { DashboardSuperadmin } from '../pages/Dashboard/Superadmin/DashboardSuperadmin';
import { DashboardFormateur } from '../pages/Dashboard/Formateur/DashboardFormateur';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Route publique - Connexion */}
      <Route path="/login" element={<Login />} />

      {/* Routes protégées - Dashboard Superadmin */}
      <Route 
        path="/dashboard/superadmin/*" 
        element={
          <PrivateRoute roles={['superadmin']}>
            <DashboardSuperadmin />
          </PrivateRoute>
        } 
      />

      {/* Routes protégées - Dashboard Formateur */}
      <Route 
        path="/dashboard/formateur/*" 
        element={
          <PrivateRoute roles={['formateur']}>
            <DashboardFormateur />
          </PrivateRoute>
        } 
      />

      {/* Route par défaut - Redirection vers le dashboard approprié */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <DashboardRedirect />
          </PrivateRoute>
        } 
      />

      {/* Redirection de la racine vers /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Route 404 - Redirige vers la page de connexion si l'URL est inconnue */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Ce composant est maintenant rendu à l'intérieur d'une PrivateRoute,
// donc nous sommes sûrs que `user` existe.
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.role === 'superadmin') {
    return <Navigate to="/dashboard/superadmin" replace />;
  } 
  
  if (user?.role === 'formateur') {
    return <Navigate to="/dashboard/formateur" replace />;
  }
  
  // Fallback au cas où le rôle ne serait pas défini, ne devrait pas arriver
  // grâce à la PrivateRoute.
  return <Navigate to="/login" replace />;
};