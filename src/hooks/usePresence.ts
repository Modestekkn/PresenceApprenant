import { useState, useEffect, useCallback } from 'react';
import { presenceStorage, presenceFormateurStorage, sessionStorage } from '../utils/storageUtils';
import type { PresenceFormateur, Session } from '../config/db';
import { getAppSettings } from '../config/constants';

interface PresenceWithDetails {
  id_presence?: number;
  id_session: number;
  id_apprenant: number;
  heure_enregistrement: string;
  present: boolean;
  created_at?: Date;
  apprenant: string;
  apprenantEmail: string;
  apprenantTelephone: string;
}

interface UsePresenceReturn {
  presences: PresenceWithDetails[];
  presenceFormateur: PresenceFormateur | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  markPresenceApprenant: (apprenantId: number, present: boolean) => Promise<boolean>;
  markPresenceFormateur: (formateurId: number, present: boolean) => Promise<boolean>;
  loadPresences: (sessionId: number) => Promise<void>;
  canMarkPresence: boolean;
}

export const usePresence = (sessionId?: number): UsePresenceReturn => {
  const [presences, setPresences] = useState<PresenceWithDetails[]>([]);
  const [presenceFormateur, setPresenceFormateur] = useState<PresenceFormateur | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canMarkPresence, setCanMarkPresence] = useState(false);

  // Vérifier si on peut marquer la présence (dans les heures autorisées)
  const checkPresenceTimeLimit = useCallback((sessionData?: Session) => {
    if (!sessionData) return false;

    const settings = getAppSettings();
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Vérifier qu'on est le bon jour
    if (sessionData.date_session !== currentDate) {
      return false;
    }

    // Vérifier qu'on est dans la plage configurée
    return currentTime >= settings.presenceStartTime && currentTime <= settings.presenceEndTime;
  }, []);

  // Charger les présences pour une session
  const loadPresences = useCallback(async (sessionId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Charger la session
      const sessionData = await sessionStorage.getById(sessionId);
      setSession(sessionData || null);

      // Vérifier si on peut marquer la présence
      setCanMarkPresence(checkPresenceTimeLimit(sessionData));

      // Charger les présences des apprenants avec détails
      const presencesWithDetails = await presenceStorage.getPresenceWithDetails(sessionId);
      setPresences(presencesWithDetails);

      // Charger la présence du formateur
      const formateurPresence = await presenceFormateurStorage.getBySession(sessionId);
      setPresenceFormateur(formateurPresence || null);

    } catch (err) {
      console.error('Erreur lors du chargement des présences:', err);
      setError('Erreur lors du chargement des présences');
    } finally {
      setIsLoading(false);
    }
  }, [checkPresenceTimeLimit]);

  // Marquer la présence d'un apprenant
  const markPresenceApprenant = useCallback(async (apprenantId: number, present: boolean): Promise<boolean> => {
    if (!sessionId) {
      setError('Aucune session sélectionnée');
      return false;
    }

    if (!canMarkPresence) {
      const settings = getAppSettings();
      setError(`La période de prise de présence est expirée (${settings.presenceStartTime}-${settings.presenceEndTime})`);
      return false;
    }

    try {
      await presenceStorage.markPresence(sessionId, apprenantId, present);
      
      // Recharger les présences
      await loadPresences(sessionId);
      
      return true;
    } catch (err) {
      console.error('Erreur lors du marquage de présence:', err);
      setError('Erreur lors du marquage de présence');
      return false;
    }
  }, [sessionId, canMarkPresence, loadPresences]);

  // Marquer la présence du formateur
  const markPresenceFormateur = useCallback(async (formateurId: number, present: boolean): Promise<boolean> => {
    if (!sessionId) {
      setError('Aucune session sélectionnée');
      return false;
    }

    if (!canMarkPresence) {
      const settings = getAppSettings();
      setError(`La période de prise de présence est expirée (${settings.presenceStartTime}-${settings.presenceEndTime})`);
      return false;
    }

    try {
      await presenceFormateurStorage.markPresence(sessionId, formateurId, present);
      
      // Recharger les présences
      await loadPresences(sessionId);
      
      return true;
    } catch (err) {
      console.error('Erreur lors du marquage de présence du formateur:', err);
      setError('Erreur lors du marquage de présence du formateur');
      return false;
    }
  }, [sessionId, canMarkPresence, loadPresences]);

  // Charger automatiquement les présences si sessionId est fourni
  useEffect(() => {
    if (sessionId) {
      loadPresences(sessionId);
    }
  }, [sessionId, loadPresences]);

  // Mettre à jour canMarkPresence toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (session) {
        setCanMarkPresence(checkPresenceTimeLimit(session));
      }
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, [session, checkPresenceTimeLimit]);

  return {
    presences,
    presenceFormateur,
    session,
    isLoading,
    error,
    markPresenceApprenant,
    markPresenceFormateur,
    loadPresences,
    canMarkPresence,
  };
};