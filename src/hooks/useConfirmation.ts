import { useState, useCallback } from 'react';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'success' | 'info';
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
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
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showConfirmation = useCallback((options: {
    title: string;
    message: string;
    type?: 'warning' | 'danger' | 'success' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    setConfirmationState({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || 'warning',
      confirmText: options.confirmText || 'Confirmer',
      cancelText: options.cancelText || 'Annuler',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel || (() => {}),
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    confirmationState.onConfirm();
    hideConfirmation();
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