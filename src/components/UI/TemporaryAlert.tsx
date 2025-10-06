import React, { useState, useEffect } from 'react';
import { Alert, AlertVariant } from './Alert';

interface TemporaryAlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  duration?: number;
  onDismiss?: () => void;
  className?: string;
}

export const TemporaryAlert: React.FC<TemporaryAlertProps> = ({
  variant,
  title,
  message,
  duration = 5000,
  onDismiss,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleClose = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`transition-all duration-300 ease-in-out ${className}`}>
      <Alert
        variant={variant}
        title={title}
        onClose={handleClose}
      >
        {message}
      </Alert>
    </div>
  );
};