import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { formateurStorage, apprenantStorage, formationStorage, sessionStorage, rapportStorage } from '@/utils/storageUtils';
import type { Session, Rapport } from '@/config/db';
import { Loader } from '@/components/UI/Loader';
import { PresenceTimeSettings } from './PresenceTimeSettings';

export const SuperadminHome: React.FC = () => {
  const [stats, setStats] = useState({
    formateurs: 0,
    apprenants: 0,
    formations: 0,
    sessionsAujourdhui: 0
  });
  const [recentSessions, setRecentSessions] = useState<(Session & { formateurNom?: string })[]>([]);
  const [rapportsEnAttente, setRapportsEnAttente] = useState<(Rapport & { sessionDetails?: Session; formateurNom?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Charger les statistiques
        const [formateurs, apprenants, formations] = await Promise.all([
          formateurStorage.getAll(),
          apprenantStorage.getAll(),
          formationStorage.getAll()
        ]);

        // Sessions d'aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = await sessionStorage.getByDate(today);

        setStats({
          formateurs: formateurs.length,
          apprenants: apprenants.length,
          formations: formations.length,
          sessionsAujourdhui: todaySessions.length
        });

        // Sessions récentes avec noms des formateurs
        const allSessions = await sessionStorage.getAll();
        const recentSessionsData = await Promise.all(
          allSessions.slice(-3).map(async (session) => {
            const formateur = await formateurStorage.getById(session.id_formateur);
            return {
              ...session,
              formateurNom: formateur ? `${formateur.prenom} ${formateur.nom}` : 'Inconnu'
            };
          })
        );
        setRecentSessions(recentSessionsData);

        // Rapports en attente (simulation - à adapter selon votre logique)
        const allRapports = await rapportStorage.getAll();
        const rapportsEnAttenteData = await Promise.all(
          allRapports.slice(-2).map(async (rapport) => {
            const session = await sessionStorage.getById(rapport.id_session);
            const formateur = await formateurStorage.getById(rapport.id_formateur);
            return {
              ...rapport,
              sessionDetails: session,
              formateurNom: formateur ? `${formateur.prenom} ${formateur.nom}` : 'Inconnu'
            };
          })
        );
        setRapportsEnAttente(rapportsEnAttenteData);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Superadmin</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble du système de présence</p>
      </div>

      {/* Actions rapides */}
      <div className="flex justify-end">
        <PresenceTimeSettings />
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Formateurs"
          value={stats.formateurs.toString()}
          icon={<Users className="w-8 h-8" />}
          color="primary"
        />
        <StatCard
          title="Apprenants"
          value={stats.apprenants.toString()}
          icon={<GraduationCap className="w-8 h-8" />}
          color="success"
        />
        <StatCard
          title="Formations"
          value={stats.formations.toString()}
          icon={<BookOpen className="w-8 h-8" />}
          color="warning"
        />
        <StatCard
          title="Sessions aujourd'hui"
          value={stats.sessionsAujourdhui.toString()}
          icon={<Calendar className="w-8 h-8" />}
          color="danger"
        />
      </div>

      {/* Sections principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions récentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sessions récentes</h2>
          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <SessionItem
                  key={session.id_session}
                  formation={`Formation ${session.id_formation}`}
                  formateur={session.formateurNom || 'Inconnu'}
                  date={`${new Date(session.date_session).toLocaleDateString('fr-FR')}, ${session.heure_debut}-${session.heure_fin}`}
                  status={session.statut}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune session récente</p>
            )}
          </div>
        </div>

        {/* Rapports en attente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rapports soumis</h2>
          <div className="space-y-3">
            {rapportsEnAttente.length > 0 ? (
              rapportsEnAttente.map((rapport) => (
                <RapportItem
                  key={rapport.id_rapport}
                  formation={`Formation ${rapport.sessionDetails?.id_formation || 'Inconnue'}`}
                  formateur={rapport.formateurNom || 'Inconnu'}
                  date={new Date(rapport.date_soumission).toLocaleDateString('fr-FR')}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun rapport récent</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour les cartes de statistiques
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    primary: 'bg-primary-500 text-white',
    success: 'bg-success-500 text-white',
    warning: 'bg-warning-500 text-white',
    danger: 'bg-danger-500 text-white',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Composant pour les éléments de session
interface SessionItemProps {
  formation: string;
  formateur: string;
  date: string;
  status: 'planifiée' | 'en cours' | 'terminée';
}

const SessionItem: React.FC<SessionItemProps> = ({ formation, formateur, date, status }) => {
  const statusColors = {
    planifiée: 'bg-gray-100 text-gray-800',
    'en cours': 'bg-success-100 text-success-800',
    terminée: 'bg-primary-100 text-primary-800',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{formation}</p>
        <p className="text-sm text-gray-600">{formateur} • {date}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
        {status}
      </span>
    </div>
  );
};

// Composant pour les éléments de rapport
interface RapportItemProps {
  formation: string;
  formateur: string;
  date: string;
}

const RapportItem: React.FC<RapportItemProps> = ({ formation, formateur, date }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{formation}</p>
        <p className="text-sm text-gray-600">{formateur} • {date}</p>
      </div>
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-800">
        En attente
      </span>
    </div>
  );
};