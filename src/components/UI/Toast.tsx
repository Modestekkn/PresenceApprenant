import React, { useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { ToastType, Toast, ToastContextType, ToastContext } from './ToastContext';
import './toast.css';

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        iconColor: 'text-emerald-500',
        titleColor: 'text-emerald-800',
        messageColor: 'text-emerald-700',
        progressColor: 'bg-emerald-500',
      };
    case 'error':
      return {
        icon: XCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        titleColor: 'text-red-800',
        messageColor: 'text-red-700',
        progressColor: 'bg-red-500',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        iconColor: 'text-amber-500',
        titleColor: 'text-amber-800',
        messageColor: 'text-amber-700',
        progressColor: 'bg-amber-500',
      };
    case 'info':
      return {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-800',
        messageColor: 'text-blue-700',
        progressColor: 'bg-blue-500',
      };
  }
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const config = getToastConfig(toast.type);
  const { icon: Icon } = config;
  const progressRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const duration = toast.duration || 5000;
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progressValue = (remaining / duration) * 100;
      
      // Mise à jour directe du style pour éviter l'erreur ESLint
      if (progressRef.current) {
        progressRef.current.style.width = `${progressValue}%`;
      }
      
      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        onRemove(toast.id);
      }
    };

    const timer = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`
        toast-item max-w-md w-full ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg pointer-events-auto
        transform transition-all duration-300 ease-in-out toast-enter
        hover:shadow-xl
      `}
    >
      {/* Barre de progression */}
      <div className="w-full h-1 bg-gray-200 rounded-t-lg overflow-hidden">
        <div 
          ref={progressRef}
          className={`h-full ${config.progressColor} toast-progress`}
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${config.titleColor}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`mt-1 text-sm ${config.messageColor}`}>
                {toast.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`
                rounded-md inline-flex ${config.titleColor} hover:${config.messageColor}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-500
                transition-colors duration-200
              `}
              onClick={() => onRemove(toast.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((current) => [...current, { ...toast, id }]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};