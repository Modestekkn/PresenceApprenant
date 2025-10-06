import React from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { Button } from './Button';
import { PDFExportService, RapportData } from '../../utils/pdfExportService';
import { useToast } from './useToast';

interface PDFExportButtonProps {
  type: 'rapport' | 'presences' | 'statistiques';
  data: unknown;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'secondary';
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  type,
  data,
  className = '',
  size = 'md',
  variant = 'outline'
}) => {
  const { showSuccess, showError } = useToast();
  const pdfService = PDFExportService.getInstance();

  const handleExport = async () => {
    try {
      switch (type) {
        case 'rapport':
          await exportRapport(data as RapportData);
          break;
        case 'presences':
          await exportPresences(data as {
            apprenant: { nom: string; prenom: string; email?: string };
            presences: Array<{
              formation: string;
              date: string;
              horaires: string;
              present: boolean;
              heure_enregistrement: string;
            }>;
          });
          break;
        case 'statistiques':
          await exportStatistiques(data as {
            periode: string;
            formations: Array<{
              nom: string;
              sessions: number;
              participants: number;
              tauxPresence: number;
            }>;
            formateurs: Array<{
              nom: string;
              prenom: string;
              sessions: number;
              tauxPresence: number;
            }>;
          });
          break;
        default:
          throw new Error('Type d\'export non supporté');
      }
      
      showSuccess('PDF exporté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      showError('Erreur lors de l\'export PDF');
    }
  };

  const exportRapport = async (rapportData: RapportData) => {
    pdfService.exportRapportSession(rapportData);
  };

  const exportPresences = async (presenceData: {
    apprenant: { nom: string; prenom: string; email?: string };
    presences: Array<{
      formation: string;
      date: string;
      horaires: string;
      present: boolean;
      heure_enregistrement: string;
    }>;
  }) => {
    pdfService.exportPresencesApprenant(
      presenceData.apprenant,
      presenceData.presences
    );
  };

  const exportStatistiques = async (statsData: {
    periode: string;
    formations: Array<{
      nom: string;
      sessions: number;
      participants: number;
      tauxPresence: number;
    }>;
    formateurs: Array<{
      nom: string;
      prenom: string;
      sessions: number;
      tauxPresence: number;
    }>;
  }) => {
    pdfService.exportStatistiques(statsData);
  };

  const getIcon = () => {
    switch (type) {
      case 'rapport':
        return <FileText className="w-4 h-4" />;
      case 'presences':
        return <Calendar className="w-4 h-4" />;
      case 'statistiques':
        return <Download className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'rapport':
        return 'Exporter le rapport';
      case 'presences':
        return 'Exporter les présences';
      case 'statistiques':
        return 'Exporter les statistiques';
      default:
        return 'Exporter PDF';
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant={variant}
      size={size}
      className={`flex items-center ${className}`}
    >
      {getIcon()}
      <span className="ml-2">{getLabel()}</span>
    </Button>
  );
};

// Composant pour l'export rapide de plusieurs formats
interface MultiExportButtonProps {
  formats: Array<{
    type: 'pdf' | 'csv' | 'excel';
    label: string;
    action: () => void;
  }>;
  className?: string;
}

export const MultiExportButton: React.FC<MultiExportButtonProps> = ({
  formats,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center"
      >
        <Download className="w-4 h-4 mr-2" />
        Exporter
        <svg
          className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {formats.map((format, index) => (
              <button
                key={index}
                onClick={() => {
                  format.action();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

