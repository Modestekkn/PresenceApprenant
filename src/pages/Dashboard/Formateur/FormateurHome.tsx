import React from 'react';
import { Clock, CheckCircle, Calendar, FileText } from 'lucide-react';

export const FormateurHome: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Formateur</h1>
        <p className="text-gray-600 mt-2">Gérez vos sessions et présences</p>
      </div>

      {/* Alerte pour la prise de présence */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-warning-600 mr-2" />
          <div>
            <p className="text-warning-800 font-medium">Période de prise de présence active</p>
            <p className="text-warning-700 text-sm">Vous pouvez marquer les présences entre 07:30 et 08:00</p>
          </div>
        </div>
      </div>

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
          <SessionCard
            formation="Développement Web Frontend"
            horaire="09:00 - 17:00"
            apprenants={15}
            status="en cours"
            presenceMarked={true}
          />
          <SessionCard
            formation="React Avancé"
            horaire="14:00 - 18:00"
            apprenants={8}
            status="planifiée"
            presenceMarked={false}
          />
        </div>
      </div>

      {/* Statistiques personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Sessions ce mois"
          value="12"
          color="primary"
        />
        <StatCard
          title="Rapports soumis"
          value="8"
          color="success"
        />
        <StatCard
          title="Taux de présence moyen"
          value="92%"
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
    <a
      href={link}
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
    </a>
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