// Service Worker pour l'application PWA

// Service Worker pour les notifications push
const CACHE_NAME = 'presence-app-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner le cache si disponible, sinon faire la requête
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('Push event reçu:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Erreur lors du parsing des données push:', e);
      data = { title: 'Notification', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'Nouvelle notification',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [
      { action: 'view', title: 'Voir' },
      { action: 'dismiss', title: 'Fermer' }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Système de Présence', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Clic sur notification:', event);

  event.notification.close();

  const action = event.action;
  const tag = event.notification.tag;
  const data = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Envoyer un message au client principal
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Essayer de trouver une fenêtre ouverte
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin)) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              action: action,
              tag: tag,
              data: data
            });
            return client.focus();
          }
        }

        // Si aucune fenêtre n'est ouverte, en ouvrir une nouvelle
        const urlToOpen = getUrlForNotification(action, tag, data);
        return clients.openWindow(urlToOpen);
      })
  );
});

// Fonction pour déterminer l'URL à ouvrir selon la notification
function getUrlForNotification(action, tag, data) {
  const baseUrl = self.location.origin;
  
  if (action === 'view') {
    switch (tag) {
      case 'new-session':
      case 'schedule-change':
        return `${baseUrl}/dashboard/apprenant/planning`;
      case 'session-reminder':
        return `${baseUrl}/dashboard/apprenant`;
      case 'presence-confirmed':
        return `${baseUrl}/dashboard/apprenant/presences`;
      case 'absence-justification':
        return `${baseUrl}/dashboard/apprenant/justifier`;
      default:
        return `${baseUrl}/dashboard`;
    }
  }
  
  return `${baseUrl}/dashboard`;
}

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Ici vous pourriez synchroniser les données en attente
    // avec votre API backend
    console.log('Synchronisation en arrière-plan effectuée');
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
  }
}

// Gestion des mises à jour de l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Planification de tâches périodiques (notifications de rappel)
let reminderTimers = new Map();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
    const { sessionId, sessionName, reminderTime } = event.data;
    
    // Annuler le timer existant s'il y en a un
    if (reminderTimers.has(sessionId)) {
      clearTimeout(reminderTimers.get(sessionId));
    }
    
    // Programmer le nouveau rappel
    const now = new Date().getTime();
    const delay = reminderTime - now;
    
    if (delay > 0) {
      const timerId = setTimeout(() => {
        self.registration.showNotification(`Rappel: ${sessionName}`, {
          body: 'Votre formation commence dans 30 minutes',
          icon: '/icons/icon-192x192.png',
          tag: 'session-reminder',
          data: { sessionId },
          actions: [
            { action: 'view', title: 'Voir les détails' },
            { action: 'dismiss', title: 'OK' }
          ]
        });
        
        reminderTimers.delete(sessionId);
      }, delay);
      
      reminderTimers.set(sessionId, timerId);
    }
  }
});

// Nettoyage des timers lors de la fermeture
self.addEventListener('beforeunload', () => {
  reminderTimers.forEach((timerId) => {
    clearTimeout(timerId);
  });
  reminderTimers.clear();
});