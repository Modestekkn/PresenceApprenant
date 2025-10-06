import React from 'react';
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';

export const SuperadminHome: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Superadmin</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble du système de présence</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Formateurs"
          value="12"
          icon={<Users className="w-8 h-8" />}
          color="primary"
        />
        <StatCard
          title="Apprenants"
          value="156"
          icon={<GraduationCap className="w-8 h-8" />}
          color="success"
        />
        <StatCard
          title="Formations"
          value="8"
          icon={<BookOpen className="w-8 h-8" />}
          color="warning"
        />
        <StatCard
          title="Sessions aujourd'hui"
          value="3"
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
            <SessionItem
              formation="Développement Web Frontend"
              formateur="Jean Dupont"
              date="Aujourd'hui, 09:00-17:00"
              status="en cours"
            />
            <SessionItem
              formation="React Avancé"
              formateur="Marie Martin"
              date="Hier, 09:00-17:00"
              status="terminée"
            />
            <SessionItem
              formation="TypeScript"
              formateur="Pierre Durand"
              date="15/01/2025, 09:00-17:00"
              status="planifiée"
            />
          </div>
        </div>

        {/* Rapports en attente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rapports en attente</h2>
          <div className="space-y-3">
            <RapportItem
              formation="JavaScript ES6"
              formateur="Sophie Bernard"
              date="14/01/2025"
            />
            <RapportItem
              formation="Node.js API"
              formateur="Michel Leblanc"
              date="13/01/2025"
            />
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