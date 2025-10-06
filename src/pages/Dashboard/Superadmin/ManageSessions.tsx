import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { sessionStorage, formateurStorage, formationStorage } from '../../../utils/storageUtils';
import type { Session, Formateur, Formation } from '../../../config/db';
import { Button } from '../../../components/UI/Button';
import { Input } from '../../../components/UI/Input';
import { Modal } from '../../../components/UI/Modal';
import { Loader } from '../../../components/UI/Loader';
import { ConfirmationModal } from '../../../components/UI/ConfirmationModal';
import { useToast } from '../../../components/UI/useToast';
import { useConfirmation } from '../../../hooks/useConfirmation';

export const ManageSessions: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { confirmationState, showConfirmation, handleConfirm, handleCancel } = useConfirmation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    date_session: '',
    heure_debut: '',
    heure_fin: '',
    id_formation: '',
    id_formateur: '',
    statut: 'planifiée' as 'planifiée' | 'en cours' | 'terminée',
  });

  // Charger toutes les données
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sessionsData, formateursData, formationsData] = await Promise.all([
        sessionStorage.getSessionsWithDetails(),
        formateurStorage.getAll(),
        formationStorage.getAll(),
      ]);
      
      setSessions(sessionsData);
      setFormateurs(formateursData);
      setFormations(formationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setSelectedSession(null);
    setFormData({
      date_session: '',
      heure_debut: '09:00',
      heure_fin: '17:00',
      id_formation: '',
      id_formateur: '',
      statut: 'planifiée',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (session: Session) => {
    setSelectedSession(session);
    setFormData({
      date_session: session.date_session,
      heure_debut: session.heure_debut,
      heure_fin: session.heure_fin,
      id_formation: session.id_formation.toString(),
      id_formateur: session.id_formateur.toString(),
      statut: session.statut,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const sessionData = {
        date_session: formData.date_session,
        heure_debut: formData.heure_debut,
        heure_fin: formData.heure_fin,
        id_formation: parseInt(formData.id_formation),
        id_formateur: parseInt(formData.id_formateur),
        statut: formData.statut,
      };

      if (selectedSession) {
        await sessionStorage.update(selectedSession.id_session!, sessionData);
      } else {
        await sessionStorage.create(sessionData);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id: number) => {
    showConfirmation({
      title: 'Supprimer la session',
      message: 'Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.',
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await sessionStorage.delete(id);
          await loadData();
          showSuccess('Session supprimée', 'La session a été supprimée avec succès.');
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          showError('Erreur de suppression', 'Une erreur est survenue lors de la suppression de la session.');
        }
      }
    });
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'planifiée':
        return 'bg-gray-100 text-gray-800';
      case 'en cours':
        return 'bg-success-100 text-success-800';
      case 'terminée':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="Chargement des sessions..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Sessions</h1>
          <p className="text-gray-600 mt-2">Planifiez et gérez les sessions de formation</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nouvelle session</span>
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Total sessions</p>
          <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Planifiées</p>
          <p className="text-2xl font-bold text-warning-600">
            {sessions.filter(s => s.statut === 'planifiée').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">En cours</p>
          <p className="text-2xl font-bold text-success-600">
            {sessions.filter(s => s.statut === 'en cours').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600">Terminées</p>
          <p className="text-2xl font-bold text-primary-600">
            {sessions.filter(s => s.statut === 'terminée').length}
          </p>
        </div>
      </div>

      {/* Liste des sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id_session} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-primary-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {session.id_formation}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {session.id_formateur}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(session.date_session).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.heure_debut} - {session.heure_fin}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.statut)}`}>
                      {session.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(session)}
                      className="p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => session.id_session && handleDelete(session.id_session)}
                      className="p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune session trouvée</p>
          </div>
        )}
      </div>

      {/* Modal d'ajout/édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSession ? 'Modifier la session' : 'Nouvelle session'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            type="date"
            label="Date de la session"
            value={formData.date_session}
            onChange={(e) => setFormData({ ...formData, date_session: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="time"
              label="Heure de début"
              value={formData.heure_debut}
              onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
              required
            />
            <Input
              type="time"
              label="Heure de fin"
              value={formData.heure_fin}
              onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formation
            </label>
            <select
              value={formData.id_formation}
              onChange={(e) => setFormData({ ...formData, id_formation: e.target.value })}
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner une formation</option>
              {formations.map((formation) => (
                <option key={formation.id_formation} value={formation.id_formation}>
                  {formation.nom_formation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formateur
            </label>
            <select
              value={formData.id_formateur}
              onChange={(e) => setFormData({ ...formData, id_formateur: e.target.value })}
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un formateur</option>
              {formateurs.map((formateur) => (
                <option key={formateur.id_formateur} value={formateur.id_formateur}>
                  {formateur.prenom} {formateur.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as 'planifiée' | 'en cours' | 'terminée' })}
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="planifiée">Planifiée</option>
              <option value="en cours">En cours</option>
              <option value="terminée">Terminée</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {selectedSession ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
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