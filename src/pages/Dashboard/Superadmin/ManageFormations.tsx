import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Trash2, BookOpen, User, Calendar, Clock } from 'lucide-react';
import type { Formation, Formateur } from '@/config/db';
import { formationStorage, formateurStorage } from '@/utils/storageUtils';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { Modal } from '@/components/UI/Modal';
import { Skeleton } from '@/components/UI/Skeleton';
import { DataTable, DataTableSkeleton } from '@/components/UI/DataTable';
import { ConfirmationModal } from '@/components/UI/ConfirmationModal';
import { useToast } from '@/components/UI/useToast';
import { useConfirmation } from '@/hooks/useConfirmation';

export const ManageFormations: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { confirmationState, showConfirmation, handleConfirm, handleCancel } = useConfirmation();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [formData, setFormData] = useState({
    nom_formation: '',
    description: '',
    id_formateur: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les formations et formateurs
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [formationsData, formateursData] = await Promise.all([
        formationStorage.getAll(),
        formateurStorage.getAll()
      ]);
      setFormations(formationsData);
      setFilteredFormations(formationsData);
      setFormateurs(formateursData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrer les formations
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFormations(formations);
    } else {
      const filtered = formations.filter(formation =>
        formation.nom_formation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formation.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFormations(filtered);
    }
  }, [searchQuery, formations]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom_formation.trim()) {
      newErrors.nom_formation = 'Le nom de la formation est obligatoire';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }

    if (!formData.id_formateur || formData.id_formateur === 0) {
      newErrors.id_formateur = 'Veuillez sélectionner un formateur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ouvrir le modal pour ajouter
  const handleAdd = () => {
    setSelectedFormation(null);
    setFormData({
      nom_formation: '',
      description: '',
      id_formateur: 0,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour modifier
  const handleEdit = (formation: Formation) => {
    setSelectedFormation(formation);
    setFormData({
      nom_formation: formation.nom_formation,
      description: formation.description,
      id_formateur: formation.id_formateur,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Supprimer une formation
  const handleDelete = (formation: Formation) => {
    showConfirmation({
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer la formation "${formation.nom_formation}" ?
      Cette action supprimera également toutes les sessions associées à cette formation.`,
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await formationStorage.delete(formation.id_formation!);
          await loadData();
          showSuccess('Formation supprimée avec succès');
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          showError('Erreur lors de la suppression de la formation');
        }
      }
    });
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (selectedFormation) {
        // Modification
        await formationStorage.update(selectedFormation.id_formation!, formData);
        showSuccess('Formation modifiée avec succès');
      } else {
        // Création
        await formationStorage.create(formData);
        showSuccess('Formation créée avec succès');
      }
      
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Erreur lors de la sauvegarde');
    }
  };

  // Obtenir le nom du formateur
  const getFormateurName = (id_formateur: number): string => {
    const formateur = formateurs.find(f => f.id_formateur === id_formateur);
    return formateur ? `${formateur.prenom} ${formateur.nom}` : 'Formateur inconnu';
  };

  // Colonnes de la table
  const columns: Array<{
    key: string;
    header: string;
    accessor: (row: Record<string, unknown>) => React.ReactNode;
  }> = [
    {
      key: 'nom_formation',
      header: 'Formation',
      accessor: (row: Record<string, unknown>) => {
        const formation = row as unknown as Formation;
        return (
          <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                {formation.nom_formation}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-1">
                {formation.description}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'formateur',
      header: 'Formateur',
      accessor: (row: Record<string, unknown>) => {
        const formation = row as unknown as Formation;
        const formateurName = getFormateurName(formation.id_formateur);
        return (
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 text-xs sm:text-sm truncate" title={formateurName}>
              {formateurName}
            </span>
          </div>
        );
      }
    },
    {
      key: 'created_at',
      header: 'Date',
      accessor: (row: Record<string, unknown>) => {
        const formation = row as unknown as Formation;
        const dateStr = formation.created_at ? 
          new Date(formation.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          }) : 
          'N/A';
        return (
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 text-xs sm:text-sm whitespace-nowrap">
              {dateStr}
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row: Record<string, unknown>) => {
        const formation = row as unknown as Formation;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="warning"
              size="icon"
              onClick={() => handleEdit(formation)}
              aria-label="Modifier"
            >
              <Edit className="w-4 h-4 text-white" />
            </Button>
            <Button
              variant="danger"
              size="icon"
              onClick={() => handleDelete(formation)}
              aria-label="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </Button>
          </div>
        );
      }
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 mb-2" />
            <Skeleton className="h-3 sm:h-4 w-64 sm:w-96" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <Skeleton className="h-9 sm:h-10 w-full sm:w-80" />
        </div>
        <DataTableSkeleton columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Gestion des Formations</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Gérez les formations de votre centre de formation
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={handleAdd}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Ajouter</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{formations.length}</p>
              <p className="text-sm sm:text-base text-gray-600 truncate">Total formations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{formateurs.length}</p>
              <p className="text-sm sm:text-base text-gray-600 truncate">Formateurs actifs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {formations.filter(f => new Date(f.created_at || 0) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm sm:text-base text-gray-600 truncate">Nouvelles (30j)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <Input
          placeholder="Rechercher une formation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
          className="w-full sm:max-w-xs lg:max-w-md"
        />
      </div>

      {/* Table des formations */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable
            data={filteredFormations as unknown as Record<string, unknown>[]}
            columns={columns}
            emptyMessage="Aucune formation trouvée"
          />
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFormation ? 'Modifier la formation' : 'Ajouter une formation'}
      >
          <div className="space-y-3 sm:space-y-4">
            <Input
              label="Nom de la formation"
              value={formData.nom_formation}
              onChange={(e) => setFormData({ ...formData, nom_formation: e.target.value })}
              error={errors.nom_formation}
              required
              requiredIndicator
              placeholder="Ex: Développement Web, Formation React..."
              className="text-sm sm:text-base"
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez les objectifs et le contenu de la formation..."
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Formateur responsable
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.id_formateur}
                onChange={(e) => setFormData({ ...formData, id_formateur: parseInt(e.target.value) })}
              >
                <option value={0}>Sélectionner un formateur</option>
                {formateurs.map((formateur) => (
                  <option key={formateur.id_formateur} value={formateur.id_formateur}>
                    {formateur.prenom} {formateur.nom} - {formateur.email}
                  </option>
                ))}
              </select>
              {errors.id_formateur && (
                <p className="text-sm text-red-600">{errors.id_formateur}</p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {selectedFormation ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
      </Modal>

      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={confirmationState.isLoading ? () => {} : handleCancel}
        title={confirmationState.title}
        message={confirmationState.message}
        onConfirm={handleConfirm}
        type={confirmationState.type}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        isLoading={confirmationState.isLoading}
      />
    </div>
  );
};