import { useState, useCallback } from 'react';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'success' | 'info';
  confirmText: string;
  cancelText: string;
  isLoading: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    isLoading: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showConfirmation = useCallback((options: {
    title: string;
    message: string;
    type?: 'warning' | 'danger' | 'success' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => {
    setConfirmationState({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || 'warning',
      confirmText: options.confirmText || 'Confirmer',
      cancelText: options.cancelText || 'Annuler',
      isLoading: false,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel || (() => {}),
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmationState(prev => ({ ...prev, isOpen: false, isLoading: false }));
  }, []);

  const handleConfirm = useCallback(async () => {
    try {
      // Mettre le modal en état de chargement
      setConfirmationState(prev => ({ ...prev, isLoading: true }));
      
      // Délai minimum pour que l'utilisateur voie le modal de chargement
      const minDelay = new Promise(resolve => setTimeout(resolve, 800));
      
      // Exécuter l'action et attendre le délai minimum
      await Promise.all([
        confirmationState.onConfirm(),
        minDelay
      ]);
      
      // Fermer le modal après succès
      hideConfirmation();
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      // En cas d'erreur, remettre le modal en état normal pour permettre de réessayer
      setConfirmationState(prev => ({ ...prev, isLoading: false }));
    }
  }, [confirmationState, hideConfirmation]);

  const handleCancel = useCallback(() => {
    confirmationState.onCancel();
    hideConfirmation();
  }, [confirmationState, hideConfirmation]);

  return {
    confirmationState,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
    handleCancel,
  };
};