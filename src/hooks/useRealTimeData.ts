/// <reference types="node" />

import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../utils/notificationService';
import { BackendApiService } from '../utils/backendApiService';
import { useAuth } from './useAuth';

interface UseRealTimeDataOptions {
  enableNotifications?: boolean;
  enableBackendSync?: boolean;
  pollInterval?: number;
}

interface RealTimeData {
  sessions: Record<string, unknown>[];
  presences: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  lastSync: Date | null;
}

export const useRealTimeData = (options: UseRealTimeDataOptions = {}) => {
  const {
    enableNotifications = true,
    enableBackendSync = false,
    pollInterval = 30000 // 30 secondes
  } = options;

  const { user } = useAuth();
  const [data, setData] = useState<RealTimeData>({
    sessions: [],
    presences: [],
    notifications: [],
    lastSync: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notificationService = NotificationService.getInstance();
  const apiService = enableBackendSync ? BackendApiService.getInstance({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    timeout: 10000
  }) : null;

  // Fonction pour synchroniser avec le backend
  const syncWithBackend = useCallback(async () => {
    if (!apiService || !user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Synchroniser selon le rôle de l'utilisateur
      if (user.role === 'formateur') {
        const [sessionsResponse, notificationsResponse] = await Promise.all([
          apiService.getSessions({ formateurId: user.id }),
          apiService.getNotifications(user.id)
        ]);

        if (sessionsResponse.success && notificationsResponse.success) {
          setData(prev => ({
            ...prev,
            sessions: sessionsResponse.data || [],
            notifications: notificationsResponse.data || [],
            lastSync: new Date()
          }));
        }
      // } else if (user.role === 'apprenant') {
      //   // Logic pour apprenant - non implémenté dans cette version
      //   const notificationsResponse = await apiService.getNotifications(user.id);
      //   
      //   if (notificationsResponse.success) {
      //     setData(prev => ({
      //       ...prev,
      //       notifications: notificationsResponse.data || [],
      //       lastSync: new Date()
      //     }));
      //   }
      } else if (user.role === 'superadmin') {
        const [sessionsResponse] = await Promise.all([
          apiService.getSessions(),
        ]);

        if (sessionsResponse.success) {
          setData(prev => ({
            ...prev,
            sessions: sessionsResponse.data || [],
            lastSync: new Date()
          }));
        }
      }

    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setError('Erreur de synchronisation avec le serveur');
    } finally {
      setIsLoading(false);
    }
  }, [apiService, user]);

  // Fonction pour envoyer des notifications
  const sendNotification = useCallback(async (
    type: 'session-reminder' | 'presence-confirmed' | 'schedule-change' | 'new-session',
    data: Record<string, unknown>
  ) => {
    if (!enableNotifications) return;

    try {
      switch (type) {
        case 'session-reminder':
          await notificationService.notifySessionReminder(
            String(data.sessionName || 'Session'),
            String(data.timeUntil || '15 minutes')
          );
          break;
        case 'presence-confirmed':
          await notificationService.notifyPresenceConfirmed(String(data.sessionName || 'Session'));
          break;
        case 'schedule-change':
          await notificationService.notifyScheduleChange(
            String(data.sessionName || 'Session'),
            String(data.oldTime || 'Ancien horaire'),
            String(data.newTime || 'Nouvel horaire')
          );
          break;
        case 'new-session':
          await notificationService.notifyNewSession(
            String(data.sessionName || 'Session'),
            String(data.date || new Date().toISOString()),
            String(data.time || '00:00')
          );
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }
  }, [enableNotifications, notificationService]);

  // Fonction pour marquer une notification comme lue
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    if (apiService) {
      try {
        await apiService.markNotificationAsRead(notificationId);
      } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
      }
    }

    // Mettre à jour localement
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        (notif.id as string) === notificationId ? { ...notif, read: true } : notif
      )
    }));
  }, [apiService]);

  // Fonction pour planifier des rappels de sessions
  const scheduleSessionReminders = useCallback(async (sessions: Record<string, unknown>[]) => {
    if (!enableNotifications) return;

    const upcomingSessions = sessions.filter(session => {
      const sessionDate = session.date_session as string;
      const sessionTime = session.heure_debut as string;
      if (!sessionDate || !sessionTime) return false;
      
      const sessionDateTime = new Date(`${sessionDate} ${sessionTime}`);
      return sessionDateTime > new Date();
    });

    await notificationService.scheduleSessionReminders(
      upcomingSessions.map(session => ({
        id: String((session.id_session as number) || 0),
        name: String((session.nom_formation as string) || `Formation ${(session.id_formation as number) || ''}`),
        date: String((session.date_session as string) || ''),
        time: String((session.heure_debut as string) || '')
      }))
    );
  }, [enableNotifications, notificationService]);

  // Effet pour initialiser les notifications
  useEffect(() => {
    if (enableNotifications) {
      notificationService.checkAndRequestPermission();
      notificationService.setupNotificationClickHandler();
    }
  }, [enableNotifications, notificationService]);

  // Effet pour la synchronisation périodique
  useEffect(() => {
    if (enableBackendSync && pollInterval > 0) {
      // Synchronisation initiale
      syncWithBackend();

      // Configuration du polling
      const interval = setInterval(syncWithBackend, pollInterval);

      return () => clearInterval(interval);
    }
  }, [enableBackendSync, pollInterval, syncWithBackend]);

  // Effet pour planifier les rappels quand les sessions changent
  useEffect(() => {
    if (data.sessions.length > 0) {
      scheduleSessionReminders(data.sessions);
    }
  }, [data.sessions, scheduleSessionReminders]);

  // Fonction pour forcer une synchronisation
  const forceSync = useCallback(async () => {
    if (enableBackendSync) {
      await syncWithBackend();
    }
  }, [enableBackendSync, syncWithBackend]);

  // Fonction pour ajouter une notification locale
  const addLocalNotification = useCallback((notification: Record<string, unknown>) => {
    setData(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications]
    }));
  }, []);

  // Fonction pour mettre à jour les données locales
  const updateLocalData = useCallback((key: keyof RealTimeData, newData: Record<string, unknown>[]) => {
    setData(prev => ({
      ...prev,
      [key]: newData,
      lastSync: new Date()
    }));
  }, []);

  return {
    // Données
    data,
    isLoading,
    error,
    
    // Actions
    sendNotification,
    markNotificationAsRead,
    scheduleSessionReminders,
    forceSync,
    addLocalNotification,
    updateLocalData,
    
    // Utilitaires
    isOnline: navigator.onLine,
    canSync: enableBackendSync && navigator.onLine,
  };
};