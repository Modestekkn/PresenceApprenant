import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/UI/Loader';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: ('superadmin' | 'formateur')[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  roles = [] 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Vérification de l'authentification..." />
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier les rôles si spécifiés
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Rediriger vers le dashboard approprié selon le rôle
    const dashboardPath = user.role === 'superadmin' ? '/dashboard/superadmin' : '/dashboard/formateur';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};