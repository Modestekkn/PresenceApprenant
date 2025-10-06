import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';

// Hook personnalisé pour utiliser le contexte
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook pour obtenir le token d'authentification
export const useAuthToken = (): string | null => {
  return localStorage.getItem('attendance_auth_token');
};

// Hook pour vérifier si l'utilisateur a un rôle spécifique
export const useHasRole = (role: 'superadmin' | 'formateur'): boolean => {
  const { user } = useAuth();
  return user?.role === role;
};

// Hook pour vérifier si l'utilisateur est un superadmin
export const useIsSuperadmin = (): boolean => {
  return useHasRole('superadmin');
};

// Hook pour vérifier si l'utilisateur est un formateur
export const useIsFormateur = (): boolean => {
  return useHasRole('formateur');
};