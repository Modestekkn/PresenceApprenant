// Constantes globales pour l'application
export const APP_CONSTANTS = {
  // Heures limites pour la prise de présence
  PRESENCE_TIME_LIMITS: {
    START_TIME: '07:30',
    END_TIME: '08:00',
  },

  // Durées de session (en minutes)
  SESSION_DURATIONS: {
    MIN_DURATION: 60, // 1 heure minimum
    MAX_DURATION: 480, // 8 heures maximum
    DEFAULT_DURATION: 120, // 2 heures par défaut
  },

  // Statuts des sessions
  SESSION_STATUS: {
    PLANNED: 'planifiée',
    IN_PROGRESS: 'en cours',
    COMPLETED: 'terminée',
  } as const,

  // Types de rapports
  RAPPORT_TYPES: {
    TEXT: 'texte',
    FILE: 'fichier',
  } as const,

  // Rôles utilisateurs
  USER_ROLES: {
    SUPERADMIN: 'superadmin',
    FORMATEUR: 'formateur',
    APPRENANT: 'apprenant',
  } as const,

  // Formats de date et heure
  DATE_FORMATS: {
    DATE_DISPLAY: 'dd/MM/yyyy',
    TIME_DISPLAY: 'HH:mm',
    DATETIME_DISPLAY: 'dd/MM/yyyy à HH:mm',
    DATE_INPUT: 'yyyy-MM-dd',
    TIME_INPUT: 'HH:mm',
  },

  // Messages de validation
  VALIDATION_MESSAGES: {
    REQUIRED_FIELD: 'Ce champ est obligatoire',
    INVALID_EMAIL: 'Adresse email invalide',
    INVALID_PHONE: 'Numéro de téléphone invalide',
    PASSWORD_MIN_LENGTH: 'Le mot de passe doit contenir au moins 6 caractères',
    TIME_RANGE_INVALID: 'L\'heure de fin doit être postérieure à l\'heure de début',
    PRESENCE_TIME_EXPIRED: 'La période de prise de présence est expirée',
  },

  // Configuration de synchronisation
  SYNC_CONFIG: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 5000, // 5 secondes
    BATCH_SIZE: 50,
    SYNC_INTERVAL: 300000, // 5 minutes
  },

  // Paramètres d'interface
  UI_CONFIG: {
    ITEMS_PER_PAGE: 10,
    SEARCH_DEBOUNCE: 300, // millisecondes
    TOAST_DURATION: 3000, // 3 secondes
    MODAL_ANIMATION_DURATION: 200,
  },

  // Configuration des fichiers
  FILE_CONFIG: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
    ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt'],
    ALLOWED_MIME_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
  },

  // URLs de l'API (à configurer selon l'environnement)
  API_ENDPOINTS: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    AUTH: '/auth',
    FORMATEURS: '/formateurs',
    APPRENANTS: '/apprenants',
    FORMATIONS: '/formations',
    SESSIONS: '/sessions',
    PRESENCES: '/presences',
    RAPPORTS: '/rapports',
    SYNC: '/sync',
  },

  // Clés de stockage local
  STORAGE_KEYS: {
    AUTH_TOKEN: 'attendance_auth_token',
    USER_DATA: 'attendance_user_data',
    LAST_SYNC: 'attendance_last_sync',
    OFFLINE_DATA: 'attendance_offline_data',
  },

  // Configuration PWA
  PWA_CONFIG: {
    UPDATE_CHECK_INTERVAL: 60000, // 1 minute
    CACHE_STRATEGY: 'NetworkFirst',
    OFFLINE_FALLBACK: '/offline.html',
  },
} as const;

// --- Fonctions pour gérer les paramètres dynamiques ---

const SETTINGS_STORAGE_KEY = 'app_settings';

interface AppSettings {
  presenceStartTime: string;
  presenceEndTime: string;
}

// Fonction pour récupérer les paramètres
export const getAppSettings = (): AppSettings => {
  const defaults = {
    presenceStartTime: APP_CONSTANTS.PRESENCE_TIME_LIMITS.START_TIME,
    presenceEndTime: APP_CONSTANTS.PRESENCE_TIME_LIMITS.END_TIME,
  };

  try {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      return { ...defaults, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error("Erreur lors de la lecture des paramètres :", error);
  }
  return defaults;
};

// Fonction pour sauvegarder les paramètres
export const saveAppSettings = (settings: Partial<AppSettings>) => {
  try {
    const currentSettings = getAppSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    // Recharger la configuration pour que l'application l'utilise immédiatement
    Object.assign(APP_CONSTANTS.PRESENCE_TIME_LIMITS, { 
        START_TIME: newSettings.presenceStartTime, 
        END_TIME: newSettings.presenceEndTime 
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres :", error);
  }
};

// Types dérivés des constantes
export type SessionStatus = typeof APP_CONSTANTS.SESSION_STATUS[keyof typeof APP_CONSTANTS.SESSION_STATUS];
export type RapportType = typeof APP_CONSTANTS.RAPPORT_TYPES[keyof typeof APP_CONSTANTS.RAPPORT_TYPES];
export type UserRole = typeof APP_CONSTANTS.USER_ROLES[keyof typeof APP_CONSTANTS.USER_ROLES];

// Fonctions utilitaires pour les constantes
export const isValidSessionStatus = (status: string): status is SessionStatus => {
  return Object.values(APP_CONSTANTS.SESSION_STATUS).includes(status as SessionStatus);
};

export const isValidRapportType = (type: string): type is RapportType => {
  return Object.values(APP_CONSTANTS.RAPPORT_TYPES).includes(type as RapportType);
};

export const isValidUserRole = (role: string): role is UserRole => {
  return Object.values(APP_CONSTANTS.USER_ROLES).includes(role as UserRole);
};