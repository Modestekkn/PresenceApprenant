import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus } from 'lucide-react';
import { sessionStorage, apprenantStorage, sessionApprenantStorage } from '../../../utils/storageUtils';
import type { Session, Apprenant } from '../../../config/db';
import { Button } from '../../../components/UI/Button';
import { Modal } from '../../../components/UI/Modal';
import { useToast } from '../../../components/UI/useToast';

export const ManageSessions: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedApprenants, setSelectedApprenants] = useState<number[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [sessionsData, apprenantsData] = await Promise.all([
        sessionStorage.getSessionsWithDetails(),
        apprenantStorage.getAll(),
      ]);
      setSessions(sessionsData);
      setApprenants(apprenantsData);
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

  const handleManageApprenants = async (session: Session) => {
    setSelectedSession(session);
    try {
      const sessionApprenants = await sessionApprenantStorage.getApprenantsBySession(session.id_session!);
      setSelectedApprenants(sessionApprenants.map(a => a.id_apprenant!));
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors du chargement');
    }
  };

  const handleToggle = (id: number) => {
    setSelectedApprenants(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!selectedSession) return;
    try {
      await sessionApprenantStorage.assignMultipleApprenants(selectedSession.id_session!, selectedApprenants);
      showSuccess('Assignation réussie');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de l\'assignation');
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Sessions</h1>
      
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Session</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id_session} className="border-t">
                <td className="px-6 py-4">
                  <div>{(session as Session & { formation?: string }).formation || 'Formation'}</div>
                  <div className="text-sm text-gray-500">{session.date_session}</div>
                </td>
                <td className="px-6 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageApprenants(session)}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Gérer les apprenants"
      >
        <div className="space-y-4">
          {apprenants.map((apprenant) => (
            <label key={apprenant.id_apprenant} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedApprenants.includes(apprenant.id_apprenant!)}
                onChange={() => handleToggle(apprenant.id_apprenant!)}
              />
              <span>{apprenant.prenom} {apprenant.nom}</span>
            </label>
          ))}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Sauvegarder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};