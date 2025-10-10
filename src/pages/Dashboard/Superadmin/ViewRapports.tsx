import React, { useState, useEffect, useCallback } from 'react';
import { Search, FileText, User, Clock, Calendar, Eye, Download, FileDown } from 'lucide-react';
import { rapportStorage } from '@/utils/storageUtils';
import { Input } from '@/components/UI/Input';
import { DataTable, DataTableSkeleton } from '@/components/UI/DataTable';
import { useToast } from '@/components/UI/useToast';
import { Button } from '@/components/UI/Button';
import { Badge } from '@/components/UI/Badge';
import { RapportDetailModal } from '@/components/Dashboard/Superadmin/RapportDetailModal';

// Définition du type pour un rapport avec détails
type RapportWithDetails = {
  id_rapport: number;
  contenu: string;
  date_soumission: string;
  id_session: number;
  session_nom: string; 
  formateur_nom: string;
  formateur_prenom: string;
  statut: 'Soumis' | 'En attente' | 'Validé' | 'Rejeté';
} & Record<string, unknown>;

export const ViewRapports: React.FC = () => {
  const { showError, showToast } = useToast();
  const [rapports, setRapports] = useState<RapportWithDetails[]>([]);
  const [filteredRapports, setFilteredRapports] = useState<RapportWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRapport, setSelectedRapport] = useState<RapportWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les rapports
  const loadRapports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await rapportStorage.getAllWithDetails(); 
      // Assurer que le statut a une valeur par défaut si non défini
      const dataWithStatus = data.map(r => ({ ...r, statut: r.statut || 'En attente' })) as RapportWithDetails[];
      setRapports(dataWithStatus);
      setFilteredRapports(dataWithStatus);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      showError('Erreur de chargement', 'Impossible de récupérer les rapports.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadRapports();
  }, [loadRapports]);

  // Filtrer les rapports
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRapports(rapports);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = rapports.filter(rapport =>
        rapport.formateur_nom.toLowerCase().includes(lowercasedQuery) ||
        rapport.formateur_prenom.toLowerCase().includes(lowercasedQuery) ||
        rapport.session_nom.toLowerCase().includes(lowercasedQuery) ||
        rapport.statut.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredRapports(filtered);
    }
  }, [searchQuery, rapports]);
  
  const getStatusBadge = (statut: RapportWithDetails['statut']) => {
    switch (statut) {
      case 'Soumis':
        return <Badge variant="info">Soumis</Badge>;
      case 'Validé':
        return <Badge variant="success">Validé</Badge>;
      case 'Rejeté':
        return <Badge variant="danger">Rejeté</Badge>;
      case 'En attente':
        return <Badge variant="warning">En attente</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const handleViewRapport = (rapport: RapportWithDetails) => {
    setSelectedRapport(rapport);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRapport(null);
  };

  const handleStatusChange = async (newStatus: 'Validé' | 'Rejeté') => {
    if (!selectedRapport) return;

    try {
      await rapportStorage.update(selectedRapport.id_rapport, { statut: newStatus });
      
      const updatedRapports = rapports.map(r => 
        r.id_rapport === selectedRapport.id_rapport ? { ...r, statut: newStatus } : r
      );
      setRapports(updatedRapports);
      
      // Mettre à jour la liste filtrée également
      const updatedFilteredRapports = filteredRapports.map(r => 
        r.id_rapport === selectedRapport.id_rapport ? { ...r, statut: newStatus } : r
      );
      setFilteredRapports(updatedFilteredRapports);

      handleCloseModal();
      showToast({
        title: 'Statut mis à jour',
        message: `Le statut du rapport a été changé en "${newStatus}".`,
        type: 'success',
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      showError("Erreur de mise à jour", "Impossible de changer le statut du rapport.");
    }
  };

  // Fonction pour exporter un rapport en PDF
  const exportRapportToPDF = (rapport: RapportWithDetails) => {
    try {
      // Créer le contenu du PDF
      const content = `
═══════════════════════════════════════════════════════════════
                    RAPPORT DE FORMATION
═══════════════════════════════════════════════════════════════

INFORMATIONS GÉNÉRALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Formateur      : ${rapport.formateur_prenom} ${rapport.formateur_nom}
  Session        : ${rapport.session_nom}
  Date de soumission : ${new Date(rapport.date_soumission).toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
  Statut         : ${rapport.statut}
  ID Rapport     : #${rapport.id_rapport}

═══════════════════════════════════════════════════════════════
                    CONTENU DU RAPPORT
═══════════════════════════════════════════════════════════════

${rapport.contenu}

═══════════════════════════════════════════════════════════════

Document généré le ${new Date().toLocaleDateString('fr-FR', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

Système de Gestion de Présence - H4-SERVICES
═══════════════════════════════════════════════════════════════
`;

      // Créer un blob avec le contenu
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rapport_${rapport.formateur_nom}_${rapport.id_rapport}_${new Date(rapport.date_soumission).toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast({
        title: 'Export réussi',
        message: 'Le rapport a été exporté avec succès.',
        type: 'success',
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showError('Erreur d\'export', 'Impossible d\'exporter le rapport.');
    }
  };

  // Fonction pour exporter tous les rapports
  const exportAllRapportsToPDF = () => {
    try {
      let content = `
═══════════════════════════════════════════════════════════════
              COMPILATION DES RAPPORTS DE FORMATION
═══════════════════════════════════════════════════════════════

Date de génération : ${new Date().toLocaleDateString('fr-FR', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

Nombre total de rapports : ${filteredRapports.length}

`;

      filteredRapports.forEach((rapport, index) => {
        content += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RAPPORT ${index + 1} / ${filteredRapports.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Formateur      : ${rapport.formateur_prenom} ${rapport.formateur_nom}
  Session        : ${rapport.session_nom}
  Date           : ${new Date(rapport.date_soumission).toLocaleDateString('fr-FR')}
  Statut         : ${rapport.statut}
  ID             : #${rapport.id_rapport}

CONTENU :
─────────────────────────────────────────────────────────────
${rapport.contenu}

`;
      });

      content += `
═══════════════════════════════════════════════════════════════

Système de Gestion de Présence - H4-SERVICES
═══════════════════════════════════════════════════════════════
`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Compilation_Rapports_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast({
        title: 'Export réussi',
        message: `${filteredRapports.length} rapport(s) exporté(s) avec succès.`,
        type: 'success',
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showError('Erreur d\'export', 'Impossible d\'exporter les rapports.');
    }
  };

  // Colonnes de la table
  const columns = [
    {
      key: 'formateur',
      header: 'Formateur',
      accessor: (row: RapportWithDetails) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span>{row.formateur_prenom} {row.formateur_nom}</span>
        </div>
      ),
    },
    {
      key: 'session',
      header: 'Session',
      accessor: (row: RapportWithDetails) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>{row.session_nom}</span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date de soumission',
      accessor: (row: RapportWithDetails) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{new Date(row.date_soumission).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      accessor: (row: RapportWithDetails) => getStatusBadge(row.statut),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row: RapportWithDetails) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleViewRapport(row)}>
            <Eye className="w-4 h-4 mr-2" />
            Consulter
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportRapportToPDF(row)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-primary-600" />
            Gestion des Rapports
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Consultez et gérez les rapports soumis par les formateurs.
          </p>
        </div>
        {filteredRapports.length > 0 && (
          <Button variant="primary" onClick={exportAllRapportsToPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Exporter tous les rapports
          </Button>
        )}
      </header>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Rechercher par formateur, session, statut..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5 text-gray-400" />}
            />
          </div>
        </div>

        {isLoading ? (
          <DataTableSkeleton columns={columns.length} />
        ) : (
          <DataTable
            columns={columns}
            data={filteredRapports}
            emptyMessage="Aucun rapport trouvé."
          />
        )}
      </div>

      <RapportDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        rapport={selectedRapport}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};