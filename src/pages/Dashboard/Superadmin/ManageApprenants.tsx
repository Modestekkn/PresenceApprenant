import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Users, Mail, Phone } from 'lucide-react';
import type { Apprenant } from '../../../config/db';
import { apprenantStorage } from '../../../utils/storageUtils';
import { Button } from '../../../components/UI/Button';
import { Input } from '../../../components/UI/Input';
import { Modal } from '../../../components/UI/Modal';
import { Skeleton } from '../../../components/UI/Skeleton';
import { DataTable, DataTableSkeleton } from '../../../components/UI/DataTable';
import { ConfirmationModal } from '../../../components/UI/ConfirmationModal';
import { useToast } from '../../../components/UI/useToast';
import { useConfirmation } from '../../../hooks/useConfirmation';

export const ManageApprenants: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { confirmationState, showConfirmation, handleConfirm, handleCancel } = useConfirmation();
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [filteredApprenants, setFilteredApprenants] = useState<Apprenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApprenant, setSelectedApprenant] = useState<Apprenant | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    numero_telephone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les apprenants
  const loadApprenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apprenantStorage.getAll();
      setApprenants(data);
      setFilteredApprenants(data);
    } catch (error) {
      console.error('Erreur lors du chargement des apprenants:', error);
      showError('Erreur lors du chargement des apprenants');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadApprenants();
  }, [loadApprenants]);

  // Filtrer les apprenants
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredApprenants(apprenants);
    } else {
      const filtered = apprenants.filter(apprenant =>
        apprenant.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apprenant.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apprenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      );
      setFilteredApprenants(filtered);
    }
  }, [searchQuery, apprenants]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (formData.numero_telephone && !/^\+?[\d\s-()]+$/.test(formData.numero_telephone)) {
      newErrors.numero_telephone = 'Format de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ouvrir le modal pour ajouter
  const handleAdd = () => {
    setSelectedApprenant(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      numero_telephone: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour modifier
  const handleEdit = (apprenant: Apprenant) => {
    setSelectedApprenant(apprenant);
    setFormData({
      nom: apprenant.nom,
      prenom: apprenant.prenom,
      email: apprenant.email || '',
      numero_telephone: apprenant.numero_telephone || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Supprimer un apprenant
  const handleDelete = (apprenant: Apprenant) => {
    showConfirmation({
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer l'apprenant "${apprenant.prenom} ${apprenant.nom}" ?\n\nCette action est irréversible.`,
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await apprenantStorage.delete(apprenant.id_apprenant!);
          await loadApprenants();
          showSuccess('Apprenant supprimé avec succès');
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          showError('Erreur lors de la suppression de l\'apprenant');
        }
      }
    });
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (selectedApprenant) {
        // Modification
        await apprenantStorage.update(selectedApprenant.id_apprenant!, formData);
        showSuccess('Apprenant modifié avec succès');
      } else {
        // Création
        await apprenantStorage.create(formData);
        showSuccess('Apprenant ajouté avec succès');
      }
      
      setIsModalOpen(false);
      await loadApprenants();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Erreur lors de la sauvegarde');
    }
  };

  // Colonnes de la table
  const columns: Array<{
    key: string;
    header: string;
    accessor: (row: Record<string, unknown>) => React.ReactNode;
  }> = [
    {
      key: 'nom',
      header: 'Nom',
      accessor: (row: Record<string, unknown>) => {
        const apprenant = row as unknown as Apprenant;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {apprenant.prenom.charAt(0)}{apprenant.nom.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {apprenant.prenom} {apprenant.nom}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (row: Record<string, unknown>) => {
        const apprenant = row as unknown as Apprenant;
        return (
          <div className="flex items-center space-x-2">
            {apprenant.email ? (
              <>
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{apprenant.email}</span>
              </>
            ) : (
              <span className="text-gray-400 italic">Non renseigné</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'numero_telephone',
      header: 'Téléphone',
      accessor: (row: Record<string, unknown>) => {
        const apprenant = row as unknown as Apprenant;
        return (
          <div className="flex items-center space-x-2">
            {apprenant.numero_telephone ? (
              <>
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{apprenant.numero_telephone}</span>
              </>
            ) : (
              <span className="text-gray-400 italic">Non renseigné</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row: Record<string, unknown>) => {
        const apprenant = row as unknown as Apprenant;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleEdit(apprenant)}
            >
              <Edit className="w-4 h-4 mr-2 text-white" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(apprenant)}
            >
              <Trash2 className="w-4 h-4 mr-2 text-white" />
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Apprenants</h1>
          <p className="text-gray-600 mt-2">
            Gérez les apprenants de votre centre de formation
          </p>
        </div>
        <Button 
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{apprenants.length}</p>
              <p className="text-gray-600">Total apprenants</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {apprenants.filter(a => a.email).length}
              </p>
              <p className="text-gray-600">Avec email</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {apprenants.filter(a => a.numero_telephone).length}
              </p>
              <p className="text-gray-600">Avec téléphone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Rechercher un apprenant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
          className="max-w-md"
        />
      </div>

      {/* Table des apprenants */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <DataTable
          data={filteredApprenants as unknown as Record<string, unknown>[]}
          columns={columns}
          emptyMessage="Aucun apprenant trouvé"
        />
      </div>

      {/* Modal d'ajout/modification */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedApprenant ? 'Modifier l\'apprenant' : 'Ajouter un apprenant'}
      >
        <div className="space-y-4">
          <Input
            label="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            error={errors.nom}
            required
            requiredIndicator
          />
          
          <Input
            label="Prénom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            error={errors.prenom}
            required
            requiredIndicator
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            helperText="Optionnel - utilisé pour les notifications"
          />
          
          <Input
            label="Numéro de téléphone"
            value={formData.numero_telephone}
            onChange={(e) => setFormData({ ...formData, numero_telephone: e.target.value })}
            error={errors.numero_telephone}
            helperText="Optionnel - format: +2290153456789 ou 0123456789"
          />
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {selectedApprenant ? 'Modifier' : 'Ajouter'}
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