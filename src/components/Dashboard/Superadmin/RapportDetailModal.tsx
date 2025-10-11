import React from 'react';
import { Modal } from '../../UI/Modal';
import { Button } from '../../UI/Button';
import { Badge } from '../../UI/Badge';
import { User, Calendar, Clock, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

type RapportWithDetails = {
  id_rapport: number;
  contenu: string;
  date_soumission: string;
  session_nom: string;
  formateur_nom: string;
  formateur_prenom: string;
  statut: 'Soumis' | 'En attente' | 'Validé' | 'Rejeté';
} & Record<string, unknown>;

interface RapportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rapport: RapportWithDetails | null;
  onStatusChange: (newStatus: 'Validé' | 'Rejeté') => void;
}

const getStatusBadge = (statut: RapportWithDetails['statut']) => {
    switch (statut) {
      case 'Soumis':
        return <Badge variant="info" icon={<FileText size={14}/>}>Soumis</Badge>;
      case 'Validé':
        return <Badge variant="success" icon={<CheckCircle size={14}/>}>Validé</Badge>;
      case 'Rejeté':
        return <Badge variant="danger" icon={<XCircle size={14}/>}>Rejeté</Badge>;
      case 'En attente':
        return <Badge variant="warning" icon={<AlertTriangle size={14}/>}>En attente</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

export const RapportDetailModal: React.FC<RapportDetailModalProps> = ({ rapport, onClose, onStatusChange, isOpen }) => {
  if (!rapport) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du Rapport">
      <div className="space-y-4">
        <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-semibold text-gray-600">Statut</span>
                {getStatusBadge(rapport.statut)}
            </div>
            <div className="flex items-center">
                <User size={16} className="text-gray-500 mr-3" />
                <span className="font-semibold text-gray-600 mr-2">Formateur:</span>
                <span>{rapport.formateur_prenom} {rapport.formateur_nom}</span>
            </div>
            <div className="flex items-center">
                <Clock size={16} className="text-gray-500 mr-3" />
                <span className="font-semibold text-gray-600 mr-2">Session:</span>
                <span>{rapport.session_nom}</span>
            </div>
            <div className="flex items-center">
                <Calendar size={16} className="text-gray-500 mr-3" />
                <span className="font-semibold text-gray-600 mr-2">Date de soumission:</span>
                <span>{new Date(rapport.date_soumission).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
        </div>

        <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-2">Contenu du rapport</h3>
            <div className="p-4 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap">{rapport.contenu}</p>
            </div>
        </div>

        {rapport.statut !== 'Validé' && rapport.statut !== 'Rejeté' && (
            <div className="mt-6 flex justify-end space-x-3">
                <Button variant="success" onClick={() => onStatusChange('Validé')}>
                    <CheckCircle size={16} className="mr-2" />
                    Valider
                </Button>
                <Button variant="danger" onClick={() => onStatusChange('Rejeté')}>
                    <XCircle size={16} className="mr-2" />
                    Rejeter
                </Button>
            </div>
        )}
      </div>
    </Modal>
  );
};
