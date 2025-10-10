import React, { useState, useEffect, useCallback } from 'react';
import { Users, Pencil, Trash2 } from 'lucide-react';
import { sessionStorage, apprenantStorage, sessionApprenantStorage, formateurStorage, formationStorage } from '@/utils/storageUtils';
import type { Session, Apprenant, Formateur, Formation } from '@/config/db';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/UI/Modal';
import { Input } from '@/components/UI/Input';
import { useToast } from '@/components/UI/useToast';

type ModalType = 'apprenants' | 'create' | 'edit' | 'delete' | null;

export const ManageSessions: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedApprenants, setSelectedApprenants] = useState<number[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  
  // État pour le formulaire de création/modification
  const [formData, setFormData] = useState({
    id_formation: 0,
    id_formateur: 0,
    date_session: '',
    heure_debut: '',
    heure_fin: '',
    statut: 'planifiée' as 'planifiée' | 'en cours' | 'terminée',
  });

  // Handlers mémorisés pour éviter la perte de focus
  const handleFormationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, id_formation: Number(e.target.value) }));
  }, []);

  const handleFormateurChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, id_formateur: Number(e.target.value) }));
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, date_session: e.target.value }));
  }, []);

  const handleHeureDebutChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, heure_debut: e.target.value }));
  }, []);

  const handleHeureFinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, heure_fin: e.target.value }));
  }, []);

  const handleStatutChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, statut: e.target.value as 'planifiée' | 'en cours' | 'terminée' }));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [sessionsData, apprenantsData, formateursData, formationsData] = await Promise.all([
        sessionStorage.getSessionsWithDetails(),
        apprenantStorage.getAll(),
        formateurStorage.getAll(),
        formationStorage.getAll(),
      ]);
      setSessions(sessionsData);
      setApprenants(apprenantsData);
      setFormateurs(formateursData);
      setFormations(formationsData);
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setModalType('create');
    setFormData({
      id_formation: formations[0]?.id_formation || 0,
      id_formateur: formateurs[0]?.id_formateur || 0,
      date_session: new Date().toISOString().split('T')[0],
      heure_debut: '08:00',
      heure_fin: '10:00',
      statut: 'planifiée',
    });
    setSelectedApprenants([]);
  };

  const handleOpenEditModal = async (session: Session) => {
    setSelectedSession(session);
    setModalType('edit');
    setFormData({
      id_formation: session.id_formation,
      id_formateur: session.id_formateur,
      date_session: session.date_session,
      heure_debut: session.heure_debut,
      heure_fin: session.heure_fin,
      statut: session.statut,
    });
    
    try {
      const sessionApprenants = await sessionApprenantStorage.getApprenantsBySession(session.id_session!);
      setSelectedApprenants(sessionApprenants.map(a => a.id_apprenant!));
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors du chargement');
    }
  };

  const handleManageApprenants = async (session: Session) => {
    setSelectedSession(session);
    try {
      const sessionApprenants = await sessionApprenantStorage.getApprenantsBySession(session.id_session!);
      setSelectedApprenants(sessionApprenants.map(a => a.id_apprenant!));
      setModalType('apprenants');
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors du chargement');
    }
  };

  const handleToggleApprenant = (id: number) => {
    setSelectedApprenants(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSaveApprenants = async () => {
    if (!selectedSession) return;
    try {
      await sessionApprenantStorage.assignMultipleApprenants(selectedSession.id_session!, selectedApprenants);
      showSuccess('Apprenants assignés avec succès');
      setModalType(null);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de l\'assignation');
    }
  };

  const handleCreateSession = async () => {
    try {
      if (!formData.id_formation || !formData.id_formateur || !formData.date_session) {
        showError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const sessionId = await sessionStorage.create(formData);
      
      // Assigner les apprenants sélectionnés
      if (selectedApprenants.length > 0) {
        await sessionApprenantStorage.assignMultipleApprenants(sessionId, selectedApprenants);
      }
      
      showSuccess('Session créée avec succès');
      setModalType(null);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de la création');
    }
  };

  const handleUpdateSession = async () => {
    if (!selectedSession) return;
    
    try {
      await sessionStorage.update(selectedSession.id_session!, formData);
      
      // Mettre à jour les apprenants
      await sessionApprenantStorage.assignMultipleApprenants(selectedSession.id_session!, selectedApprenants);
      
      showSuccess('Session modifiée avec succès');
      setModalType(null);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de la modification');
    }
  };

  const handleDeleteSession = async (session: Session) => {
    setSessionToDelete(session);
    setModalType('delete');
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    try {
      await sessionStorage.delete(sessionToDelete.id_session!);
      showSuccess('Session supprimée avec succès');
      setModalType(null);
      setSessionToDelete(null);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de la suppression');
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedSession(null);
    setSelectedApprenants([]);
    setSessionToDelete(null);
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Gestion des Sessions</h1>
        <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
          Créer une session
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formation</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formateur</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Horaires</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sessions.map((session) => {
              const formation = formations.find(f => f.id_formation === session.id_formation);
              const formateur = formateurs.find(f => f.id_formateur === session.id_formateur);
              
              return (
                <tr key={session.id_session}>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="font-medium text-gray-900 text-sm">{formation?.nom_formation || 'Formation inconnue'}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formateur ? `${formateur.prenom} ${formateur.nom}` : 'Non assigné'}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(session.date_session).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                    <div className="text-sm text-gray-900">
                      {session.heure_debut} - {session.heure_fin}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      session.statut === 'planifiée' ? 'bg-gray-100 text-gray-800' :
                      session.statut === 'en cours' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {session.statut}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleManageApprenants(session)}
                        title="Gérer les apprenants"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenEditModal(session)}
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="icon"
                        onClick={() => handleDeleteSession(session)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Aucune session créée. Cliquez sur "Créer une session" pour commencer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal pour gérer les apprenants */}
      <Modal
        isOpen={modalType === 'apprenants'}
        onClose={closeModal}
        title="Gérer les apprenants de la session"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button onClick={handleSaveApprenants}>
              Enregistrer
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Sélectionnez les apprenants qui participeront à cette session :
          </p>
          {apprenants.map((apprenant) => (
            <label key={apprenant.id_apprenant} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                checked={selectedApprenants.includes(apprenant.id_apprenant!)}
                onChange={() => handleToggleApprenant(apprenant.id_apprenant!)}
              />
              <span className="text-gray-900">{apprenant.prenom} {apprenant.nom}</span>
            </label>
          ))}
          {apprenants.length === 0 && (
            <p className="text-center text-gray-500 py-4">Aucun apprenant disponible</p>
          )}
        </div>
      </Modal>

      {/* Modal pour créer/modifier une session */}
      <Modal
        isOpen={modalType === 'create' || modalType === 'edit'}
        onClose={closeModal}
        title={modalType === 'create' ? 'Créer une nouvelle session' : 'Modifier la session'}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button onClick={modalType === 'create' ? handleCreateSession : handleUpdateSession}>
              {modalType === 'create' ? 'Créer' : 'Modifier'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Formation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formation <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.id_formation}
              onChange={handleFormationChange}
            >
              <option value={0}>Sélectionner une formation</option>
              {formations.map((formation) => (
                <option key={formation.id_formation} value={formation.id_formation}>
                  {formation.nom_formation}
                </option>
              ))}
            </select>
          </div>

          {/* Formateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formateur <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.id_formateur}
              onChange={handleFormateurChange}
            >
              <option value={0}>Sélectionner un formateur</option>
              {formateurs.map((formateur) => (
                <option key={formateur.id_formateur} value={formateur.id_formateur}>
                  {formateur.prenom} {formateur.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <Input
            label="Date de la session"
            type="date"
            required
            value={formData.date_session}
            onChange={handleDateChange}
          />

          {/* Horaires */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Heure de début"
              type="time"
              required
              value={formData.heure_debut}
              onChange={handleHeureDebutChange}
            />
            <Input
              label="Heure de fin"
              type="time"
              required
              value={formData.heure_fin}
              onChange={handleHeureFinChange}
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.statut}
              onChange={handleStatutChange}
            >
              <option value="planifiée">Planifiée</option>
              <option value="en cours">En cours</option>
              <option value="terminée">Terminée</option>
            </select>
          </div>

          {/* Apprenants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apprenants participant à cette session
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {apprenants.map((apprenant) => (
                <label key={apprenant.id_apprenant} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={selectedApprenants.includes(apprenant.id_apprenant!)}
                    onChange={() => handleToggleApprenant(apprenant.id_apprenant!)}
                  />
                  <span className="text-gray-900">{apprenant.prenom} {apprenant.nom}</span>
                </label>
              ))}
              {apprenants.length === 0 && (
                <p className="text-center text-gray-500 py-2">Aucun apprenant disponible</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedApprenants.length} apprenant(s) sélectionné(s)
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        title="Confirmer la suppression"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button variant="danger" onClick={confirmDeleteSession}>
              Supprimer
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir supprimer cette session ?
          </p>
          {sessionToDelete && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Formation :</strong> {formations.find(f => f.id_formation === sessionToDelete.id_formation)?.nom_formation || 'Inconnue'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Formateur :</strong> {formateurs.find(f => f.id_formateur === sessionToDelete.id_formateur)?.prenom} {formateurs.find(f => f.id_formateur === sessionToDelete.id_formateur)?.nom || 'Non assigné'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date :</strong> {new Date(sessionToDelete.date_session).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Horaires :</strong> {sessionToDelete.heure_debut} - {sessionToDelete.heure_fin}
              </p>
            </div>
          )}
          <p className="text-sm text-red-600 font-medium">
            Cette action est irréversible et supprimera également toutes les présences associées.
          </p>
        </div>
      </Modal>
    </div>
  );
};