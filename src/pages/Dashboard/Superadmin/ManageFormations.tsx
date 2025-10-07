import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, User, Calendar, Clock } from 'lucide-react';
import type { Formation, Formateur } from '../../../config/db';
import { formationStorage, formateurStorage } from '../../../utils/storageUtils';
import { Button } from '../../../components/UI/Button';
import { Input } from '../../../components/UI/Input';
import { Modal } from '../../../components/UI/Modal';
import { Skeleton } from '../../../components/UI/Skeleton';
import { DataTable, DataTableSkeleton } from '../../../components/UI/DataTable';
import { ConfirmationModal } from '../../../components/UI/ConfirmationModal';
import { useToast } from '../../../components/UI/useToast';
import { useConfirmation } from '../../../hooks/useConfirmation';

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
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {formation.nom_formation}
              </p>
              <p className="text-sm text-gray-500 line-clamp-1">
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
        return (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">
              {getFormateurName(formation.id_formateur)}
            </span>
          </div>
        );
      }
    },
    {
      key: 'created_at',
      header: 'Date de création',
      accessor: (row: Record<string, unknown>) => {
        const formation = row as unknown as Formation;
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">
              {formation.created_at ? 
                new Date(formation.created_at).toLocaleDateString('fr-FR') : 
                'Non disponible'
              }
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
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(formation)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(formation)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        );
      }
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-80" />
        </div>
        <DataTableSkeleton columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Formations</h1>
          <p className="text-gray-600 mt-2">
            Gérez les formations de votre centre de formation
          </p>
        </div>
        <Button 
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une formation
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{formations.length}</p>
              <p className="text-gray-600">Total formations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{formateurs.length}</p>
              <p className="text-gray-600">Formateurs actifs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formations.filter(f => new Date(f.created_at || 0) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-gray-600">Nouvelles (30j)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Rechercher une formation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
          className="max-w-md"
        />
      </div>

      {/* Table des formations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <DataTable
          data={filteredFormations as unknown as Record<string, unknown>[]}
          columns={columns}
          emptyMessage="Aucune formation trouvée"
        />
      </div>

      {/* Modal d'ajout/modification */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFormation ? 'Modifier la formation' : 'Ajouter une formation'}
      >
        <div className="space-y-4">
          <Input
            label="Nom de la formation"
            value={formData.nom_formation}
            onChange={(e) => setFormData({ ...formData, nom_formation: e.target.value })}
            error={errors.nom_formation}
            required
            requiredIndicator
            placeholder="Ex: Développement Web, Formation React..."
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={4}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSave}>
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