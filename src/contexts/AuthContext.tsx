import React, { createContext, useReducer, useEffect } from 'react';
import { superadminStorage, formateurStorage } from '../utils/storageUtils';

// Types pour l'authentification
export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'superadmin' | 'formateur';
  numero_telephone?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: 'superadmin' | 'formateur') => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// Reducer pour gérer l'état d'authentification
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// État initial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Créer le contexte
const AuthContextInternal = createContext<AuthContextType | undefined>(undefined);

// Exporter le contexte pour les hooks
export const AuthContext = AuthContextInternal;

// Clés de stockage local
const STORAGE_KEYS = {
  AUTH_TOKEN: 'attendance_auth_token',
  USER_DATA: 'attendance_user_data',
};

// Provider du contexte d'authentification
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          const user: AuthUser = JSON.parse(userData);
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut d\'authentification:', error);
        // Nettoyer le stockage local en cas d'erreur
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    };

    checkAuthStatus();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string, role: 'superadmin' | 'formateur'): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      let user: AuthUser | null = null;

      if (role === 'superadmin') {
        const superadmin = await superadminStorage.getByEmail(email);
        if (superadmin && superadmin.mot_de_passe === password) {
          user = {
            id: superadmin.id_superadmin!,
            nom: superadmin.nom,
            prenom: superadmin.prenom,
            email: superadmin.email,
            role: 'superadmin',
          };
        }
      } else if (role === 'formateur') {
        const formateur = await formateurStorage.getByEmail(email);
        if (formateur && formateur.mot_de_passe === password) {
          user = {
            id: formateur.id_formateur!,
            nom: formateur.nom,
            prenom: formateur.prenom,
            email: formateur.email,
            role: 'formateur',
            numero_telephone: formateur.numero_telephone,
          };
        }
      }

      if (user) {
        // Générer un token simple (en production, utiliser JWT)
        const token = btoa(`${user.id}_${user.role}_${Date.now()}`);
        
        // Sauvegarder dans le stockage local
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        return true;
      } else {
        dispatch({ 
          type: 'LOGIN_FAILURE', 
          payload: 'Email ou mot de passe incorrect' 
        });
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: 'Une erreur est survenue lors de la connexion' 
      });
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    dispatch({ type: 'LOGOUT' });
  };

  // Fonction pour effacer les erreurs
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContextInternal.Provider value={value}>
      {children}
    </AuthContextInternal.Provider>
  );
};