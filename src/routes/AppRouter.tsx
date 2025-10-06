import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { PrivateRoute } from './PrivateRoute';
import { Login } from '../pages/Login';

// Import des dashboards (à créer)
import { DashboardSuperadmin } from '../pages/Dashboard/Superadmin/DashboardSuperadmin';
import { DashboardFormateur } from '../pages/Dashboard/Formateur/DashboardFormateur';

export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
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

          {/* Route par défaut - Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardRedirect />
              </PrivateRoute>
            } 
          />

          {/* Route par défaut - Redirection */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Route 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Composant pour rediriger vers le bon dashboard selon le rôle
const DashboardRedirect: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('attendance_user_data') || '{}');
  
  if (user.role === 'superadmin') {
    return <Navigate to="/dashboard/superadmin" replace />;
  } else if (user.role === 'formateur') {
    return <Navigate to="/dashboard/formateur" replace />;
  }
  
  return <Navigate to="/login" replace />;
};