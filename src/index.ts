// Exports centralisés pour tous les utilitaires

// Base de données
export * from './config/db';
export * from './config/constants';

// Utilitaires
export * from './utils/dateUtils';
export * from './utils/storageUtils';
// export * from './utils/syncUtils'; // Temporairement désactivé

// Contexts
export * from './contexts/AuthContext';

// Hooks
export * from './hooks/useAuth';
export * from './hooks/usePresence';

// Composants UI
export * from './components/UI/Button';
export * from './components/UI/Input';
export * from './components/UI/Modal';
export * from './components/UI/Loader';

// Types communs
export interface SessionWithDetails {
  id_session?: number;
  date_session: string;
  heure_debut: string;
  heure_fin: string;
  id_formation: number;
  id_formateur: number;
  statut: 'planifiée' | 'en cours' | 'terminée';
  formation: string;
  formateur: string;
  created_at?: Date;
}

export interface PresenceWithDetails {
  id_presence?: number;
  id_session: number;
  id_apprenant: number;
  heure_enregistrement: string;
  present: boolean;
  apprenant: string;
  apprenantEmail: string;
  apprenantTelephone: string;
  created_at?: Date;
}

export interface RapportWithDetails {
  id_rapport?: number;
  id_session: number;
  id_formateur: number;
  type_rapport: 'texte' | 'fichier';
  contenu: string;
  date_soumission: string;
  session: string;
  formateur: string;
  formation: string;
  created_at?: Date;
}

// Fonctions utilitaires communes
export const formatDateFr = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTimeFr = (time: string): string => {
  return time; // Déjà au format HH:mm
};

export const getInitials = (prenom: string, nom: string): string => {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
};

export const generatePassword = (length: number = 8): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+229|00229)?[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Messages de notification
export const NOTIFICATION_MESSAGES = {
  SUCCESS: {
    FORMATEUR_CREATED: 'Formateur créé avec succès',
    FORMATEUR_UPDATED: 'Formateur mis à jour avec succès',
    FORMATEUR_DELETED: 'Formateur supprimé avec succès',
    SESSION_CREATED: 'Session créée avec succès',
    SESSION_UPDATED: 'Session mise à jour avec succès',
    SESSION_DELETED: 'Session supprimée avec succès',
    PRESENCE_MARKED: 'Présence marquée avec succès',
    RAPPORT_SUBMITTED: 'Rapport soumis avec succès',
    SYNC_COMPLETED: 'Synchronisation terminée avec succès',
  },
  ERROR: {
    GENERIC: 'Une erreur est survenue',
    NETWORK: 'Erreur de connexion réseau',
    VALIDATION: 'Données invalides',
    PERMISSION: 'Accès non autorisé',
    NOT_FOUND: 'Élément non trouvé',
    PRESENCE_TIME_EXPIRED: 'Période de présence expirée (07:30-08:00)',
    FILE_TOO_LARGE: 'Fichier trop volumineux (max 5 MB)',
    INVALID_FILE_TYPE: 'Type de fichier non autorisé',
  },
  WARNING: {
    UNSAVED_CHANGES: 'Vous avez des modifications non sauvegardées',
    OFFLINE_MODE: 'Mode hors ligne - les données seront synchronisées lors de la reconnexion',
    SYNC_PENDING: 'Synchronisation en attente',
  },
} as const;