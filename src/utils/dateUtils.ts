import { format, isValid, parseISO, isAfter, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { APP_CONSTANTS } from '../config/constants';

/**
 * Formate une date selon le format spécifié
 */
export const formatDate = (date: Date | string, formatStr: string = APP_CONSTANTS.DATE_FORMATS.DATE_DISPLAY): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Date invalide';
    }
    return format(dateObj, formatStr, { locale: fr });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return 'Date invalide';
  }
};

/**
 * Formate une heure selon le format HH:mm
 */
export const formatTime = (time: string | Date): string => {
  try {
    if (typeof time === 'string') {
      // Si c'est déjà au format HH:mm, on retourne tel quel
      if (/^\d{2}:\d{2}$/.test(time)) {
        return time;
      }
      // Sinon on essaie de parser
      const dateObj = parseISO(time);
      return format(dateObj, APP_CONSTANTS.DATE_FORMATS.TIME_DISPLAY);
    }
    return format(time, APP_CONSTANTS.DATE_FORMATS.TIME_DISPLAY);
  } catch (error) {
    console.error('Erreur lors du formatage de l\'heure:', error);
    return '00:00';
  }
};

/**
 * Formate une date et heure complète
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, APP_CONSTANTS.DATE_FORMATS.DATETIME_DISPLAY);
};

/**
 * Vérifie si l'heure actuelle est dans la plage autorisée pour la prise de présence
 */
export const isWithinPresenceTimeLimit = (sessionDate?: string): boolean => {
  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  const currentDate = format(now, 'yyyy-MM-dd');
  
  // Si une date de session est fournie, vérifier qu'on est le bon jour
  if (sessionDate && sessionDate !== currentDate) {
    return false;
  }
  
  const startTime = APP_CONSTANTS.PRESENCE_TIME_LIMITS.START_TIME;
  const endTime = APP_CONSTANTS.PRESENCE_TIME_LIMITS.END_TIME;
  
  return currentTime >= startTime && currentTime <= endTime;
};

/**
 * Vérifie si une heure est valide (format HH:mm)
 */
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Vérifie si une heure de fin est postérieure à une heure de début
 */
export const isEndTimeAfterStartTime = (startTime: string, endTime: string): boolean => {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const startDateTime = parse(`${today} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const endDateTime = parse(`${today} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());
  
  return isAfter(endDateTime, startDateTime);
};

/**
 * Calcule la durée en minutes entre deux heures
 */
export const calculateDurationInMinutes = (startTime: string, endTime: string): number => {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return 0;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const startDateTime = parse(`${today} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const endDateTime = parse(`${today} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());
  
  if (isAfter(startDateTime, endDateTime)) {
    return 0;
  }
  
  return Math.floor((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));
};

/**
 * Vérifie si une session est en cours
 */
export const isSessionActive = (sessionDate: string, startTime: string, endTime: string): boolean => {
  const now = new Date();
  const currentDate = format(now, 'yyyy-MM-dd');
  const currentTime = format(now, 'HH:mm');
  
  if (sessionDate !== currentDate) {
    return false;
  }
  
  return currentTime >= startTime && currentTime <= endTime;
};

/**
 * Vérifie si une session est terminée
 */
export const isSessionCompleted = (sessionDate: string, endTime: string): boolean => {
  const now = new Date();
  const currentDate = format(now, 'yyyy-MM-dd');
  const currentTime = format(now, 'HH:mm');
  
  // Si c'est une date passée, la session est terminée
  if (sessionDate < currentDate) {
    return true;
  }
  
  // Si c'est aujourd'hui, vérifier l'heure
  if (sessionDate === currentDate) {
    return currentTime > endTime;
  }
  
  // Si c'est une date future, la session n'est pas terminée
  return false;
};

/**
 * Génère l'heure actuelle au format HH:mm
 */
export const getCurrentTime = (): string => {
  return format(new Date(), 'HH:mm');
};

/**
 * Génère la date actuelle au format yyyy-MM-dd
 */
export const getCurrentDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Convertit une date au format ISO en date locale
 */
export const isoToLocalDate = (isoDate: string): string => {
  try {
    const date = parseISO(isoDate);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Erreur lors de la conversion de date ISO:', error);
    return getCurrentDate();
  }
};

/**
 * Convertit une date locale en format ISO
 */
export const localDateToISO = (localDate: string): string => {
  try {
    const date = parse(localDate, 'yyyy-MM-dd', new Date());
    return date.toISOString();
  } catch (error) {
    console.error('Erreur lors de la conversion en ISO:', error);
    return new Date().toISOString();
  }
};

/**
 * Vérifie si une date est aujourd'hui
 */
export const isToday = (date: string | Date): boolean => {
  const today = getCurrentDate();
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  return dateStr === today;
};

/**
 * Vérifie si une date est dans le futur
 */
export const isFutureDate = (date: string): boolean => {
  const today = getCurrentDate();
  return date > today;
};

/**
 * Vérifie si une date est dans le passé
 */
export const isPastDate = (date: string): boolean => {
  const today = getCurrentDate();
  return date < today;
};