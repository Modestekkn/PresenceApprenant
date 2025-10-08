import React, { useState, useEffect } from 'react';
import { Send, Upload, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { sessionStorage, rapportStorage } from '@/utils/storageUtils';
import type { Session, Rapport } from '@/config/db';
import { Button } from '@/components/UI/Button';
import { Loader } from '@/components/UI/Loader';
import { useToast } from '@/components/UI/useToast';

export const SoumettreRapport: React.FC = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [existingRapport, setExistingRapport] = useState<Rapport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportType, setReportType] = useState<'texte' | 'fichier'>('texte');
  const [reportContent, setReportContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Charger les sessions terminées du formateur
  useEffect(() => {
    const loadCompletedSessions = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const allSessions = await sessionStorage.getByFormateur(user.id);
        const completedSessions = allSessions.filter(session => {
          const today = new Date().toISOString().split('T')[0];
          const currentTime = new Date().toTimeString().slice(0, 5);
          
          // Session terminée si c'est une date passée ou si c'est aujourd'hui et l'heure de fin est passée
          return session.date_session < today || 
                 (session.date_session === today && currentTime > session.heure_fin);
        });
        
        setSessions(completedSessions);
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletedSessions();
  }, [user]);

  // Charger le rapport existant pour la session sélectionnée
  useEffect(() => {
    const loadExistingReport = async () => {
      if (!selectedSession) return;

      try {
        const rapport = await rapportStorage.getBySession(selectedSession.id_session!);
        setExistingRapport(rapport || null);
        
        if (rapport) {
          setReportType(rapport.type_rapport);
          setReportContent(rapport.contenu);
        } else {
          setReportContent('');
          setSelectedFile(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du rapport:', error);
      }
    };

    loadExistingReport();
  }, [selectedSession]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Fichier trop volumineux', 'Le fichier ne doit pas dépasser 5 MB');
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        showError('Type de fichier non autorisé', 'Types de fichiers autorisés: PDF, DOC, DOCX, TXT');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSession || !user) return;

    if (reportType === 'texte' && reportContent.trim() === '') {
      showError('Contenu manquant', 'Veuillez saisir le contenu du rapport');
      return;
    }

    if (reportType === 'fichier' && !selectedFile && !existingRapport) {
      showError('Fichier manquant', 'Veuillez sélectionner un fichier');
      return;
    }

    setIsSubmitting(true);
    try {
      let contenu = reportContent;
      
      if (reportType === 'fichier' && selectedFile) {
        // Dans une vraie application, on uploadrait le fichier vers un serveur
        // Ici, on simule en stockant le nom du fichier
        contenu = `Fichier: ${selectedFile.name}`;
      }

      const rapportData = {
        id_session: selectedSession.id_session!,
        id_formateur: user.id,
        type_rapport: reportType,
        contenu,
        date_soumission: new Date().toISOString(),
        statut: 'Soumis' as const,
      };

      if (existingRapport) {
        // Mise à jour du rapport existant
        await rapportStorage.update(existingRapport.id_rapport!, rapportData);
      } else {
        // Création d'un nouveau rapport
        await rapportStorage.create(rapportData);
      }

      // Recharger le rapport
      const updatedRapport = await rapportStorage.getBySession(selectedSession.id_session!);
      setExistingRapport(updatedRapport || null);
      
      showSuccess('Rapport soumis avec succès !', 'Votre rapport a été enregistré et sera traité.');
    } catch (error) {
      console.error('Erreur lors de la soumission du rapport:', error);
      showError('Erreur de soumission', 'Une erreur est survenue lors de la soumission du rapport. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
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
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune session terminée</h2>
        <p className="text-gray-600">Vous n'avez aucune session terminée nécessitant un rapport.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Soumettre un Rapport</h1>
        <p className="text-gray-600 mt-2">Soumettez le rapport de fin de formation</p>
      </div>

      {/* Sélection de session */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner une session</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => {
            const hasReport = existingRapport && existingRapport.id_session === session.id_session;
            
            return (
              <button
                key={session.id_session}
                onClick={() => setSelectedSession(session)}
                className={`p-4 rounded-lg border text-left transition-colors relative ${
                  selectedSession?.id_session === session.id_session
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {hasReport && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  </div>
                )}
                <p className="font-medium text-gray-900">{session.id_formation}</p>
                <p className="text-sm text-gray-600">
                  {session.date_session} • {session.heure_debut} - {session.heure_fin}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {hasReport ? 'Rapport soumis' : 'Rapport en attente'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {selectedSession && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Rapport pour: {selectedSession.id_formation}
          </h2>

          {/* Type de rapport */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de rapport
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="texte"
                  checked={reportType === 'texte'}
                  onChange={(e) => setReportType(e.target.value as 'texte' | 'fichier')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Rapport texte</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="fichier"
                  checked={reportType === 'fichier'}
                  onChange={(e) => setReportType(e.target.value as 'texte' | 'fichier')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Upload de fichier</span>
              </label>
            </div>
          </div>

          {/* Contenu du rapport */}
          {reportType === 'texte' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu du rapport
              </label>
              <textarea
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Rédigez votre rapport de fin de formation..."
              />
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier du rapport
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Cliquez pour sélectionner un fichier ou glissez-déposez
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Formats acceptés: PDF, DOC, DOCX, TXT (max 5 MB)
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer"
                >
                  Sélectionner un fichier
                </label>
                
                {selectedFile && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statut du rapport existant */}
          {existingRapport && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
                <div>
                  <p className="text-success-800 font-medium">Rapport déjà soumis</p>
                  <p className="text-success-700 text-sm">
                    Soumis le {new Date(existingRapport.date_soumission).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setSelectedSession(null)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{existingRapport ? 'Mettre à jour' : 'Soumettre'} le rapport</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};