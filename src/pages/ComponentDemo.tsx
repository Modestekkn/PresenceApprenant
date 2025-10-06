import React from 'react';
import { useToast } from '../components/UI/useToast';
import { useConfirmation } from '../hooks/useConfirmation';
import { Button } from '../components/UI/Button';
import { ConfirmationModal } from '../components/UI/ConfirmationModal';
import { Alert } from '../components/UI/Alert';
import { TemporaryAlert } from '../components/UI/TemporaryAlert';
import { Skeleton } from '../components/UI/Skeleton';
import { OfflineBanner } from '../components/UI/OfflineBanner';

export const ComponentDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { confirmationState, showConfirmation, handleConfirm, handleCancel } = useConfirmation();

  const handleToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        showSuccess('Opération réussie !', 'Votre action a été complétée avec succès.');
        break;
      case 'error':
        showError('Erreur détectée', 'Une erreur est survenue lors du traitement.');
        break;
      case 'warning':
        showWarning('Attention requise', 'Veuillez vérifier les informations saisies.');
        break;
      case 'info':
        showInfo('Information', 'Une nouvelle mise à jour est disponible.');
        break;
    }
  };

  const handleConfirmationDemo = (type: 'warning' | 'danger' | 'info') => {
    showConfirmation({
      title: type === 'danger' ? 'Action dangereuse' : type === 'warning' ? 'Confirmation requise' : 'Information',
      message: type === 'danger' 
        ? 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?' 
        : type === 'warning'
        ? 'Souhaitez-vous vraiment effectuer cette action ?'
        : 'Cette action va modifier les données. Continuer ?',
      type,
      confirmText: type === 'danger' ? 'Supprimer' : 'Confirmer',
      onConfirm: () => {
        showSuccess('Action confirmée', 'L\'action a été exécutée avec succès.');
      }
    });
  };

  return (
  <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Démonstration des Composants
      </h1>

      {/* Section Toasts */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Notifications Toast
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="success"
            onClick={() => handleToastDemo('success')}
          >
            Toast Succès
          </Button>
          <Button
            variant="danger"
            onClick={() => handleToastDemo('error')}
          >
            Toast Erreur
          </Button>
          <Button
            variant="warning"
            onClick={() => handleToastDemo('warning')}
          >
            Toast Avertissement
          </Button>
          <Button
            variant="outline"
            onClick={() => handleToastDemo('info')}
          >
            Toast Info
          </Button>
        </div>
      </div>

      {/* Section Modals de Confirmation */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Modals de Confirmation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="warning"
            onClick={() => handleConfirmationDemo('warning')}
          >
            Confirmation Standard
          </Button>
          <Button
            variant="danger"
            onClick={() => handleConfirmationDemo('danger')}
          >
            Action Dangereuse
          </Button>
          <Button
            variant="outline"
            onClick={() => handleConfirmationDemo('info')}
          >
            Information
          </Button>
        </div>
      </div>

      {/* Section Alertes Statiques */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Alertes Statiques
        </h2>
        <div className="space-y-4">
          <Alert variant="success" title="Succès">
            Votre action a été complétée avec succès. Tous les changements ont été sauvegardés.
          </Alert>
          <Alert variant="error" title="Erreur">
            Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.
          </Alert>
          <Alert variant="warning" title="Attention">
            Cette action nécessite une attention particulière. Vérifiez vos données avant de continuer.
          </Alert>
          <Alert variant="info">
            Nouvelle fonctionnalité disponible ! Découvrez les dernières améliorations de l'application.
          </Alert>
        </div>
      </div>

      {/* Section Alertes Temporaires */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Alertes Temporaires
        </h2>
        <div className="space-y-4">
          <TemporaryAlert
            variant="success"
            title="Message temporaire"
            message="Cette alerte va disparaître automatiquement dans 5 secondes."
            duration={5000}
          />
          <TemporaryAlert
            variant="warning"
            message="Alerte sans titre qui disparaît rapidement."
            duration={3000}
          />
        </div>
      </div>

      {/* Section Skeleton */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Skeletons</h2>
        <div className="grid grid-cols-3 gap-4 max-w-lg">
          <Skeleton size="sm" height="sm" />
          <Skeleton size="md" height="sm" />
            <Skeleton size="lg" height="sm" />
          <Skeleton size="full" height="xl" className="col-span-3 rounded-lg" />
          <Skeleton variant="circle" size="sm" height="sm" className="w-14 h-14" />
          <Skeleton size="md" height="lg" className="col-span-2" />
        </div>
      </div>

      {/* Offline banner (demo) */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Bannière Offline</h2>
        <p className="text-sm text-gray-600 mb-4">Coupez la connexion pour voir la bannière globale en haut de l'application.</p>
        <OfflineBanner />
      </div>

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