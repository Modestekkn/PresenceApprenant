// Service Worker pour les notifications push
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.init();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  async showNotification(
    title: string,
    options: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: Record<string, unknown>;
      actions?: Array<{
        action: string;
        title: string;
        icon?: string;
      }>;
    } = {}
  ): Promise<boolean> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return false;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
          badge: options.badge || '/icons/icon-72x72.png',
          tag: options.tag || 'default',
          data: options.data,
          requireInteraction: true,
        });
      } else {
        new Notification(title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
          tag: options.tag || 'default',
          data: options.data,
        });
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la notification:', error);
      return false;
    }
  }

  // Notifications pré-définies pour l'application
  async notifyNewSession(sessionName: string, date: string, time: string) {
    return this.showNotification('Nouvelle session programmée', {
      body: `${sessionName} - ${date} à ${time}`,
      tag: 'new-session',
      actions: [
        { action: 'view', title: 'Voir le planning' },
        { action: 'dismiss', title: 'Fermer' }
      ]
    });
  }

  async notifySessionReminder(sessionName: string, timeUntil: string) {
    return this.showNotification('Rappel de formation', {
      body: `${sessionName} commence dans ${timeUntil}`,
      tag: 'session-reminder',
      actions: [
        { action: 'view', title: 'Voir les détails' },
        { action: 'dismiss', title: 'Fermer' }
      ]
    });
  }

  async notifyPresenceConfirmed(sessionName: string) {
    return this.showNotification('Présence confirmée', {
      body: `Votre présence à ${sessionName} a été enregistrée`,
      tag: 'presence-confirmed'
    });
  }

  async notifyAbsenceJustificationStatus(status: 'approved' | 'rejected', date: string) {
    const title = status === 'approved' 
      ? 'Justification approuvée' 
      : 'Justification refusée';
    const body = status === 'approved'
      ? `Votre justification d'absence du ${date} a été approuvée`
      : `Votre justification d'absence du ${date} a été refusée`;

    return this.showNotification(title, {
      body,
      tag: 'absence-justification'
    });
  }

  async notifyScheduleChange(sessionName: string, oldTime: string, newTime: string) {
    return this.showNotification('Modification d\'horaire', {
      body: `${sessionName}: ${oldTime} → ${newTime}`,
      tag: 'schedule-change',
      actions: [
        { action: 'view', title: 'Voir le planning' },
        { action: 'dismiss', title: 'OK' }
      ]
    });
  }

  // Gestion des clics sur les notifications
  setupNotificationClickHandler() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationClick(event.data.action, event.data.tag);
        }
      });
    }
  }

  private handleNotificationClick(action: string, tag: string) {
    switch (action) {
      case 'view':
        if (tag === 'new-session' || tag === 'schedule-change') {
          window.location.href = '/dashboard/apprenant/planning';
        } else if (tag === 'session-reminder') {
          window.location.href = '/dashboard/apprenant';
        }
        break;
      case 'dismiss':
        // Ne rien faire, la notification sera fermée automatiquement
        break;
    }
  }

  // Planifier des rappels de formation
  async scheduleSessionReminders(sessions: Array<{
    id: string;
    name: string;
    date: string;
    time: string;
  }>) {
    for (const session of sessions) {
      const sessionDateTime = new Date(`${session.date} ${session.time}`);
      const reminderTime = new Date(sessionDateTime.getTime() - 30 * 60 * 1000); // 30 min avant
      
      if (reminderTime > new Date()) {
        setTimeout(() => {
          this.notifySessionReminder(session.name, '30 minutes');
        }, reminderTime.getTime() - Date.now());
      }
    }
  }

  // Vérifier les permissions et afficher une demande si nécessaire
  async checkAndRequestPermission(): Promise<void> {
    if (this.permission === 'default') {
      const granted = await this.requestPermission();
      if (granted) {
        await this.showNotification('Notifications activées', {
          body: 'Vous recevrez maintenant les notifications de l\'application',
          tag: 'permission-granted'
        });
      }
    }
  }
}