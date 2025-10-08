import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export type ConfirmationType = 'warning' | 'danger' | 'success' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  details?: string; // Ligne supplémentaire optionnelle pour donner un contexte
  iconOverride?: React.ReactNode;
}

const getTypeConfig = (type: ConfirmationType) => {
  const base = {
    wrapper: 'rounded-lg border p-4 flex gap-4 items-start',
  };
  switch (type) {
    case 'danger':
      return { ...base, icon: XCircle, iconColor: 'text-red-600 dark:text-red-600', bgColor: 'bg-red-50 dark:bg-red-500/10', borderColor: 'border-red-200 dark:border-red-600/40', confirmButtonVariant: 'danger' as const };
    case 'warning':
      return { ...base, icon: AlertTriangle, iconColor: 'text-amber-600 dark:text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-500/10', borderColor: 'border-amber-200 dark:border-amber-600/40', confirmButtonVariant: 'warning' as const };
    case 'success':
      return { ...base, icon: CheckCircle, iconColor: 'text-emerald-600 dark:text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10', borderColor: 'border-emerald-200 dark:border-emerald-600/40', confirmButtonVariant: 'primary' as const };
    case 'info':
      return { ...base, icon: Info, iconColor: 'text-blue-600 dark:text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-500/10', borderColor: 'border-blue-200 dark:border-blue-600/40', confirmButtonVariant: 'primary' as const };
    default:
      return { ...base, icon: AlertTriangle, iconColor: 'text-amber-600 dark:text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-500/10', borderColor: 'border-amber-200 dark:border-amber-600/40', confirmButtonVariant: 'warning' as const };
  }
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isLoading = false,
  details,
  iconOverride,
}) => {
  const { icon: Icon, iconColor, bgColor, borderColor, confirmButtonVariant, wrapper } = getTypeConfig(type);

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className={`${wrapper} ${bgColor} ${borderColor} border animate-[fadeIn_.25s_ease-out] flex-col sm:flex-row`}>
        <div className="flex-shrink-0 mt-1 mx-auto sm:mx-0">
          {iconOverride ? iconOverride : <Icon className={`h-7 w-7 ${iconColor}`} />}
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-sm text-gray-700 dark:text-gray-700 leading-relaxed">{message}</p>
          {details && (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-l-transparent sm:border-l pl-0 sm:pl-3 border-gray-300/60 dark:border-gray-600/60">
              {details}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="sm:min-w-[120px]"
        >
          {cancelText}
        </Button>
        <Button
          variant={confirmButtonVariant}
          onClick={handleConfirm}
          isLoading={isLoading}
          className="sm:min-w-[140px]"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};