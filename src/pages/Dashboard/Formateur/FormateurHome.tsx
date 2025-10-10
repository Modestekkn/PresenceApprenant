import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, Calendar, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { sessionStorage, rapportStorage, sessionApprenantStorage } from '@/utils/storageUtils';
import type { Session } from '@/config/db';
import { Loader } from '@/components/UI/Loader';
import { getAppSettings } from '@/config/constants';

export const FormateurHome: React.FC = () => {
  const { user } = useAuth();
  const [todaySessions, setTodaySessions] = useState<(Session & { apprenantCount: number })[]>([]);
  const [stats, setStats] = useState({
    sessionsCeMois: 0,
    rapportssoumis: 0,
    tauxPresenceMoyen: 0
  });
  const [isPresenceTimeActive, setIsPresenceTimeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFormateurData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Sessions d'aujourd'hui avec compteur d'apprenants
        const today = new Date().toISOString().split('T')[0];
        const sessionsToday = await sessionStorage.getByFormateur(user.id);
        const todaySessionsFiltered = sessionsToday.filter(
          session => session.date_session === today
        );

        // Enrichir chaque session avec le nombre d'apprenants assignés
        const sessionsWithApprenants = await Promise.all(
          todaySessionsFiltered.map(async (session) => {
            const apprenants = await sessionApprenantStorage.getApprenantsBySession(session.id_session!);
            return {
              ...session,
              apprenantCount: apprenants.length
            };
          })
        );
        setTodaySessions(sessionsWithApprenants);

        // Statistiques du mois
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const allSessions = await sessionStorage.getByFormateur(user.id);
        const sessionsCeMois = allSessions.filter(session => {
          const sessionDate = new Date(session.date_session);
          return sessionDate.getMonth() === currentMonth && 
                 sessionDate.getFullYear() === currentYear;
        });

        // Rapports soumis
        const rapports = await rapportStorage.getByFormateur(user.id);
        const rapportsCeMois = rapports.filter(rapport => {
          const rapportDate = new Date(rapport.date_soumission);
          return rapportDate.getMonth() === currentMonth && 
                 rapportDate.getFullYear() === currentYear;
        });

        setStats({
          sessionsCeMois: sessionsCeMois.length,
          rapportssoumis: rapportsCeMois.length,
          tauxPresenceMoyen: 92 // TODO: Calculer le vrai taux
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données formateur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormateurData();
  }, [user]);

  // Vérifier si c'est l'heure de prise de présence
  useEffect(() => {
    const checkPresenceTime = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const { presenceStartTime, presenceEndTime } = getAppSettings();
      
      const isActive = currentTime >= presenceStartTime && 
                      currentTime <= presenceEndTime;
      
      setIsPresenceTimeActive(isActive);
    };

    checkPresenceTime();
    const interval = setInterval(checkPresenceTime, 60000); // Vérifier chaque minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Formateur</h1>
        <p className="text-gray-600 mt-2">Gérez vos sessions et présences</p>
      </div>

      {/* Alerte pour la prise de présence */}
      {isPresenceTimeActive ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-green-800 font-medium">Période de prise de présence active</p>
              <p className="text-green-700 text-sm">Vous pouvez marquer les présences entre {getAppSettings().presenceStartTime} et {getAppSettings().presenceEndTime}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-orange-800 font-medium">Hors période de prise de présence</p>
              <p className="text-orange-700 text-sm">La prise de présence est disponible entre {getAppSettings().presenceStartTime} et {getAppSettings().presenceEndTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <ActionCard
          title="Marquer les présences"
          description="Marquez votre présence et celle de vos apprenants"
          icon={<CheckCircle className="w-8 h-8" />}
          color="success"
          link="/dashboard/formateur/presence"
        />
        <ActionCard
          title="Soumettre un rapport"
          description="Soumettez le rapport de fin de formation"
          icon={<FileText className="w-8 h-8" />}
          color="primary"
          link="/dashboard/formateur/rapport"
        />
      </div>

      {/* Sessions du jour */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          Mes sessions d'aujourd'hui
        </h2>
        <div className="space-y-3">
          {todaySessions.length > 0 ? (
            todaySessions.map((session) => (
              <SessionCard
                key={session.id_session}
                formation={`Formation ${session.id_formation}`}
                horaire={`${session.heure_debut} - ${session.heure_fin}`}
                apprenants={session.apprenantCount}
                status={session.statut}
                presenceMarked={false} // TODO: Vérifier si la présence est marquée
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune session programmée aujourd'hui</p>
          )}
        </div>
      </div>

      {/* Statistiques personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Sessions ce mois"
          value={stats.sessionsCeMois.toString()}
          color="primary"
        />
        <StatCard
          title="Rapports soumis"
          value={stats.rapportssoumis.toString()}
          color="success"
        />
        <StatCard
          title="Taux de présence moyen"
          value={`${stats.tauxPresenceMoyen}%`}
          color="warning"
        />
      </div>
    </div>
  );
};

// Composant pour les cartes d'action
interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger';
  link: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, color, link }) => {
  const colorClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    success: 'bg-success-500 text-white hover:bg-success-600',
    warning: 'bg-warning-500 text-white hover:bg-warning-600',
    danger: 'bg-danger-500 text-white hover:bg-danger-600',
  };

  return (
    <Link
      to={link}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};

// Composant pour les cartes de session
interface SessionCardProps {
  formation: string;
  horaire: string;
  apprenants: number;
  status: 'planifiée' | 'en cours' | 'terminée';
  presenceMarked: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ 
  formation, 
  horaire, 
  apprenants, 
  status, 
  presenceMarked 
}) => {
  const statusColors = {
    planifiée: 'bg-gray-100 text-gray-800',
    'en cours': 'bg-success-100 text-success-800',
    terminée: 'bg-primary-100 text-primary-800',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{formation}</h3>
        <p className="text-sm text-gray-600">{horaire} • {apprenants} apprenants</p>
      </div>
      <div className="flex items-center space-x-3">
        {presenceMarked && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">
            Présence marquée
          </span>
        )}
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

// Composant pour les statistiques
interface StatCardProps {
  title: string;
  value: string;
  color: 'primary' | 'success' | 'warning';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  const colorClasses = {
    primary: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${colorClasses[color]}`}>{value}</p>
    </div>
  );
};