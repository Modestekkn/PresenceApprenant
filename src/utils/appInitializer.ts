// Configuration et initialisation de tous les services de l'application
import { NotificationService } from './notificationService';
import { BackendApiService } from './backendApiService';

export interface AppConfig {
  // Configuration API
  api?: {
    baseUrl: string;
    apiKey?: string;
    timeout: number;
    enableSync: boolean;
  };
  
  // Configuration notifications
  notifications?: {
    enabled: boolean;
    requestPermissionOnLoad: boolean;
    reminderAdvanceTime: number; // en minutes
  };
  
  // Configuration PWA
  pwa?: {
    enableServiceWorker: boolean;
    enableBackgroundSync: boolean;
  };
  
  // Configuration de l'application
  app?: {
    presenceTimeWindow: {
      start: string;
      end: string;
    };
    defaultSessionDuration: number; // en minutes
    autoSaveInterval: number; // en millisecondes
  };
}

export class AppInitializer {
  private static instance: AppInitializer;
  private config: AppConfig;
  private services: {
    notifications?: NotificationService;
    api?: BackendApiService;
  } = {};

  constructor(config: AppConfig) {
    this.config = config;
  }

  static getInstance(config?: AppConfig): AppInitializer {
    if (!AppInitializer.instance) {
      if (!config) {
        throw new Error('Configuration requise pour initialiser l\'application');
      }
      AppInitializer.instance = new AppInitializer(config);
    }
    return AppInitializer.instance;
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initialisation de l\'application...');

    try {
      // Initialiser les services en parallèle
      await Promise.all([
        this.initializeNotifications(),
        this.initializeApi(),
        this.initializeServiceWorker(),
        this.setupEventListeners()
      ]);

      console.log('✅ Application initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }

  private async initializeNotifications(): Promise<void> {
    if (!this.config.notifications?.enabled) {
      console.log('📴 Notifications désactivées');
      return;
    }

    try {
      this.services.notifications = NotificationService.getInstance();
      
      if (this.config.notifications.requestPermissionOnLoad) {
        await this.services.notifications.checkAndRequestPermission();
      }
      
      console.log('🔔 Service de notifications initialisé');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
    }
  }

  private async initializeApi(): Promise<void> {
    if (!this.config.api?.enableSync) {
      console.log('🔌 Synchronisation API désactivée');
      return;
    }

    try {
      this.services.api = BackendApiService.getInstance({
        baseUrl: this.config.api.baseUrl,
        apiKey: this.config.api.apiKey,
        timeout: this.config.api.timeout
      });

      // Test de connexion
      const healthCheck = await this.services.api.healthCheck();
      if (healthCheck.success) {
        console.log('🌐 Service API initialisé et connecté');
      } else {
        console.warn('⚠️ Service API initialisé mais non connecté');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'API:', error);
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    if (!this.config.pwa?.enableServiceWorker || !('serviceWorker' in navigator)) {
      console.log('⚙️ Service Worker désactivé ou non supporté');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version disponible
              this.notifyAppUpdate();
            }
          });
        }
      });

      console.log('⚙️ Service Worker enregistré');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
    }
  }

  private async setupEventListeners(): Promise<void> {
    // Écouter les changements de connexion
    window.addEventListener('online', () => {
      console.log('🌐 Connexion rétablie');
      this.handleOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      console.log('📡 Connexion perdue');
      this.handleOnlineStatus(false);
    });

    // Écouter les changements de visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handlePageVisible();
      }
    });

    console.log('👂 Event listeners configurés');
  }

  private handleOnlineStatus(isOnline: boolean): void {
    if (isOnline && this.services.api) {
      // Relancer la synchronisation
      this.services.api.healthCheck().then(result => {
        if (result.success) {
          // Synchroniser les données en attente
          console.log('🔄 Synchronisation des données...');
        }
      });
    }
  }

  private handlePageVisible(): void {
    // Vérifier les nouvelles notifications ou mises à jour
    if (this.services.api) {
      // Rafraîchir les données si nécessaire
      console.log('👁️ Page visible, vérification des mises à jour...');
    }
  }

  private notifyAppUpdate(): void {
    if (this.services.notifications) {
      this.services.notifications.showNotification('Mise à jour disponible', {
        body: 'Une nouvelle version de l\'application est disponible',
        tag: 'app-update',
        data: { action: 'update' }
      });
    }
  }

  // Méthodes publiques pour accéder aux services
  getNotificationService(): NotificationService | undefined {
    return this.services.notifications;
  }

  getApiService(): BackendApiService | undefined {
    return this.services.api;
  }

  getConfig(): AppConfig {
    return this.config;
  }

  // Méthode pour mettre à jour la configuration
  updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Configuration par défaut
export const defaultConfig: AppConfig = {
  api: {
    baseUrl: 'http://localhost:3001/api',
    timeout: 10000,
    enableSync: false // Désactivé par défaut pour le développement local
  },
  notifications: {
    enabled: true,
    requestPermissionOnLoad: true,
    reminderAdvanceTime: 30 // 30 minutes avant la session
  },
  pwa: {
    enableServiceWorker: true,
    enableBackgroundSync: true
  },
  app: {
    presenceTimeWindow: {
      start: '07:30',
      end: '08:00'
    },
    defaultSessionDuration: 120, // 2 heures
    autoSaveInterval: 30000 // 30 secondes
  }
};

// Fonction d'initialisation simplifiée
export const initializeApp = async (customConfig?: Partial<AppConfig>): Promise<AppInitializer> => {
  const config = { ...defaultConfig, ...customConfig };
  const initializer = AppInitializer.getInstance(config);
  await initializer.initialize();
  return initializer;
};