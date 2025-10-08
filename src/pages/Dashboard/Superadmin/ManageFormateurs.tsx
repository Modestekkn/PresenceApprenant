import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import type { Formateur } from '@/config/db';
import { formateurStorage } from '@/utils/storageUtils';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { Modal } from '@/components/UI/Modal';
import { Skeleton } from '@/components/UI/Skeleton';
import { DataTable, DataTableSkeleton } from '@/components/UI/DataTable';
import { ConfirmationModal } from '@/components/UI/ConfirmationModal';
import { useToast } from '@/components/UI/useToast';
import { useConfirmation } from '@/hooks/useConfirmation';

export const ManageFormateurs: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { confirmationState, showConfirmation, handleConfirm, handleCancel } = useConfirmation();
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [filteredFormateurs, setFilteredFormateurs] = useState<Formateur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormateur, setSelectedFormateur] = useState<Formateur | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    numero_telephone: '',
    mot_de_passe: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les formateurs
  const loadFormateurs = async () => {
    setIsLoading(true);
    try {
      const data = await formateurStorage.getAll();
      setFormateurs(data);
      setFilteredFormateurs(data);
    } catch (error) {
      console.error('Erreur lors du chargement des formateurs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFormateurs();
  }, []);

  // Filtrer les formateurs
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFormateurs(formateurs);
    } else {
      const filtered = formateurs.filter(formateur =>
        formateur.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formateur.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formateur.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFormateurs(filtered);
    }
  }, [searchQuery, formateurs]);

  // Ouvrir le modal pour ajouter un formateur
  const handleAdd = () => {
    setSelectedFormateur(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      numero_telephone: '',
      mot_de_passe: '',
    });
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour éditer un formateur
  const handleEdit = (formateur: Formateur) => {
    setSelectedFormateur(formateur);
    setFormData({
      nom: formateur.nom,
      prenom: formateur.prenom,
      email: formateur.email,
      numero_telephone: formateur.numero_telephone,
      mot_de_passe: '', // Ne pas pré-remplir le mot de passe
    });
    setIsModalOpen(true);
  };

  // Sauvegarder un formateur
  const validate = () => {
    const newErrors: Record<string,string> = {};
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email invalide';
    if (!selectedFormateur && !formData.mot_de_passe.trim()) newErrors.mot_de_passe = 'Mot de passe requis';
    if (!formData.numero_telephone.trim()) newErrors.numero_telephone = 'Téléphone requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (selectedFormateur) {
        const updateData: Partial<Formateur> = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          numero_telephone: formData.numero_telephone,
        };
        if (formData.mot_de_passe.trim() !== '') {
          updateData.mot_de_passe = formData.mot_de_passe;
        }
        await formateurStorage.update(selectedFormateur.id_formateur!, updateData);
        showSuccess('Formateur mis à jour', 'Les informations ont été enregistrées.');
      } else {
        await formateurStorage.create(formData);
        showSuccess('Formateur créé', 'Le formateur a été ajouté.');
      }
      setIsModalOpen(false);
      await loadFormateurs();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Échec', 'Impossible d\'enregistrer le formateur.');
    }
  };

  // Supprimer un formateur
  const handleDelete = async (id: number) => {
    showConfirmation({
      title: 'Supprimer le formateur',
      message: 'Êtes-vous sûr de vouloir supprimer ce formateur ? Cette action est irréversible.',
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await formateurStorage.delete(id);
          await loadFormateurs();
          showSuccess('Formateur supprimé', 'Le formateur a été supprimé avec succès.');
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          showError('Erreur de suppression', 'Une erreur est survenue lors de la suppression du formateur.');
        }
      }
    });
  };

  const [sortKey, setSortKey] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const allowedSortKeys = React.useMemo<Array<keyof Formateur | 'fullName'>>(() => (
    ['prenom','nom','email','numero_telephone','fullName']
  ), []);

  const projectValue = (f: Formateur, key: keyof Formateur | 'fullName'): string => {
    if (key === 'fullName') return `${f.prenom} ${f.nom}`.trim();
    const v = f[key];
    if (v instanceof Date) return v.toISOString();
    if (typeof v === 'number') return String(v);
    return (v as string) ?? '';
  };
  const sortedFormateurs = React.useMemo<Formateur[]>(() => {
    if (!sortKey || !sortDirection) return filteredFormateurs;
  if (!allowedSortKeys.includes(sortKey as keyof Formateur | 'fullName')) return filteredFormateurs;
    const copy = [...filteredFormateurs];
    copy.sort((a,b) => {
  const av = projectValue(a, sortKey as keyof Formateur | 'fullName');
  const bv = projectValue(b, sortKey as keyof Formateur | 'fullName');
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredFormateurs, sortKey, sortDirection, allowedSortKeys]);

  const handleSortChange = (key: string, direction: 'asc' | 'desc' | null) => {
    setSortKey(direction ? key : undefined);
    setSortDirection(direction);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton size="lg" height="sm" className="rounded" />
            <Skeleton size="md" height="xs" className="mt-2 w-48" />
          </div>
          <Skeleton size="sm" height="md" className="rounded" />
        </div>
        <div className="max-w-md">
          <Skeleton size="full" height="md" className="rounded" />
        </div>
        <DataTableSkeleton columns={4} rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Formateurs</h1>
          <p className="text-gray-600 mt-2">Gérez les comptes des formateurs</p>
        </div>
        <Button variant='primary' onClick={handleAdd} className="flex items-center border-gray-100 bg-green-700 hover:bg-green-900 space-x-2">
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Rechercher un formateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search />}
        />
      </div>

      <DataTable
        columns={[
          {
            key: 'fullName',
            header: 'Formateur',
            sortable: true,
            accessor: (f: Formateur) => (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-600/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 dark:text-primary-300 font-medium text-sm">
                    {f.prenom.charAt(0)}{f.nom.charAt(0)}
                  </span>
                </div>
                <span className="font-medium">{f.prenom} {f.nom}</span>
              </div>
            ),
          },
            { key: 'email', header: 'Email', sortable: true },
            { key: 'numero_telephone', header: 'Téléphone', sortable: true },
            {
              key: 'actions',
              header: 'Actions',
              accessor: (f: Formateur) => (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="warning"
                    size="icon"
                    onClick={() => handleEdit(f)}
                    aria-label="Modifier"
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={() => handleDelete(f.id_formateur!)}
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </Button>
                </div>
              ),
            },
        ]}
        data={sortedFormateurs.map(f => ({ ...f, fullName: `${f.prenom} ${f.nom}` }))}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        emptyMessage="Aucun formateur trouvé"
      />

      {/* Modal d'ajout/édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFormateur ? 'Modifier le formateur' : 'Ajouter un formateur'}
        size="md"
      >
        <form
          onSubmit={(e) => { e.preventDefault(); handleSave(); }}
          className="space-y-5"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              required
              error={errors.prenom}
            />
            <Input
              label="Nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              error={errors.nom}
            />
          </div>
          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            error={errors.email}
            helperText={!errors.email ? 'Utilisez une adresse valide (ex: nom@domaine.com)' : undefined}
          />
          <Input
            type="tel"
            label="Numéro de téléphone"
            value={formData.numero_telephone}
            onChange={(e) => setFormData({ ...formData, numero_telephone: e.target.value })}
            required
            error={errors.numero_telephone}
          />
          <Input
            type="password"
            label={selectedFormateur ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            value={formData.mot_de_passe}
            onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
            required={!selectedFormateur}
            error={errors.mot_de_passe}
            helperText={selectedFormateur ? 'Laissez vide pour ne pas changer.' : 'Minimum 6 caractères.'}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit">{selectedFormateur ? 'Mettre à jour' : 'Ajouter'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        type={confirmationState.type}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
      />
    </div>
  );
};