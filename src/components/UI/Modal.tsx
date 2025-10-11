import React from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // Ajout de la prop footer
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer, // Ajout de la prop footer
  size = 'md',
  showCloseButton = true,
}) => {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const hasInitialFocusRef = React.useRef(false);

  React.useEffect(() => {
    if (!isOpen) {
      hasInitialFocusRef.current = false;
      return;
    }
    
    const previouslyFocused = document.activeElement as HTMLElement | null;
    
    // Focus le premier input seulement lors de l'ouverture initiale
    if (!hasInitialFocusRef.current) {
      hasInitialFocusRef.current = true;
      const firstInput = dialogRef.current?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), select, textarea'
      );
      if (firstInput) {
        // Petit délai pour laisser le modal s'afficher
        setTimeout(() => firstInput.focus(), 50);
      }
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables && focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('keydown', handleKey, true);
      if (!isOpen) {
        previouslyFocused?.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          'relative w-full transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all outline-none',
          sizeClasses[size]
        )}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 pr-8">{title}</h3>
          {showCloseButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors border-gray-200"
              aria-label="Fermer"
              tabIndex={-1}
            >
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}