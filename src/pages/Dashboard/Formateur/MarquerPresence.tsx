import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { usePresence } from '../../../hooks/usePresence';
import { sessionStorage, sessionApprenantStorage } from '../../../utils/storageUtils';
import type { Session, Apprenant } from '../../../config/db';
import { Button } from '../../../components/UI/Button';
import { Loader } from '../../../components/UI/Loader';

export const MarquerPresence: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const {
    presences,
    presenceFormateur,
    canMarkPresence,
    markPresenceApprenant,
    markPresenceFormateur,
    error
  } = usePresence(selectedSession?.id_session);

  // Mettre à jour l'heure actuelle
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Charger les sessions du formateur pour aujourd'hui
  useEffect(() => {
    const loadTodaySessions = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const allSessions = await sessionStorage.getByFormateur(user.id);
        const todaySessions = allSessions.filter(session => session.date_session === today);
        setSessions(todaySessions);

        // Sélectionner automatiquement la première session
        if (todaySessions.length > 0) {
          setSelectedSession(todaySessions[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodaySessions();
  }, [user]);

  // Charger les apprenants assignés à la session
  useEffect(() => {
    const loadApprenants = async () => {
      if (!selectedSession) return;

      try {
        // Utiliser la nouvelle relation session-apprenants
        const assignedApprenants = await sessionApprenantStorage.getApprenantsBySession(selectedSession.id_session!);
        setApprenants(assignedApprenants);
      } catch (error) {
        console.error('Erreur lors du chargement des apprenants:', error);
      }
    };

    loadApprenants();
  }, [selectedSession]);

  const handleMarkFormateurPresence = async () => {
    if (!user || !selectedSession) return;
    
    const success = await markPresenceFormateur(user.id, true);
    if (success) {
      console.log('Présence du formateur marquée avec succès');
    }
  };

  const handleMarkApprenantPresence = async (apprenantId: number, present: boolean) => {
    const success = await markPresenceApprenant(apprenantId, present);
    if (success) {
      console.log(`Présence de l'apprenant ${apprenantId} marquée: ${present ? 'présent' : 'absent'}`);
    }
  };

  const isPresenceTimeActive = () => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    return currentTimeString >= '07:30' && currentTimeString <= '08:00';
  };

  const getPresenceStatus = (apprenantId: number) => {
    const presence = presences.find(p => p.id_apprenant === apprenantId);
    return presence ? presence.present : null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="Chargement des sessions..." />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune session aujourd'hui</h2>
        <p className="text-gray-600">Vous n'avez aucune session programmée pour aujourd'hui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marquer les Présences</h1>
        <p className="text-gray-600 mt-2">
          Heure actuelle: {currentTime.toLocaleTimeString('fr-FR')} - 
          Période de présence: 07:30 - 08:00
        </p>
      </div>

      {/* Statut de la période de présence */}
      <div className={`p-4 rounded-lg border ${
        isPresenceTimeActive() 
          ? 'bg-success-50 border-success-200' 
          : 'bg-warning-50 border-warning-200'
      }`}>
        <div className="flex items-center">
          {isPresenceTimeActive() ? (
            <>
              <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
              <div>
                <p className="text-success-800 font-medium">Période de présence active</p>
                <p className="text-success-700 text-sm">Vous pouvez marquer les présences maintenant</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-warning-600 mr-2" />
              <div>
                <p className="text-warning-800 font-medium">Période de présence fermée</p>
                <p className="text-warning-700 text-sm">
                  La prise de présence est autorisée uniquement entre 07:30 et 08:00
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sélection de session */}
      {sessions.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner une session</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session) => (
              <button
                key={session.id_session}
                onClick={() => setSelectedSession(session)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedSession?.id_session === session.id_session
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{session.id_formation}</p>
                <p className="text-sm text-gray-600">
                  {session.heure_debut} - {session.heure_fin}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSession && (
        <>
          {/* Présence du formateur */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ma présence</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">
                    {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
                  <p className="text-sm text-gray-600">Formateur</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {presenceFormateur ? (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-success-100 text-success-800">
                    Présent • {presenceFormateur.heure_enregistrement}
                  </span>
                ) : (
                  <Button
                    onClick={handleMarkFormateurPresence}
                    disabled={!canMarkPresence}
                    variant="success"
                    size="sm"
                  >
                    Marquer ma présence
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Liste des apprenants */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Présence des apprenants ({apprenants.length})
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {apprenants.map((apprenant) => {
                const presenceStatus = getPresenceStatus(apprenant.id_apprenant!);
                
                return (
                  <div key={apprenant.id_apprenant} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {apprenant.prenom.charAt(0)}{apprenant.nom.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {apprenant.prenom} {apprenant.nom}
                        </p>
                        {apprenant.email && (
                          <p className="text-sm text-gray-600">{apprenant.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {presenceStatus !== null ? (
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          presenceStatus 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-danger-100 text-danger-800'
                        }`}>
                          {presenceStatus ? 'Présent' : 'Absent'}
                        </span>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleMarkApprenantPresence(apprenant.id_apprenant!, true)}
                            disabled={!canMarkPresence}
                            variant="success"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Présent</span>
                          </Button>
                          <Button
                            onClick={() => handleMarkApprenantPresence(apprenant.id_apprenant!, false)}
                            disabled={!canMarkPresence}
                            variant="danger"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Absent</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};