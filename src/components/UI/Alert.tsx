import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const getAlertConfig = (variant: AlertVariant) => {
  switch (variant) {
    case 'success':
      return {
        icon: CheckCircle,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        iconColor: 'text-emerald-500',
        titleColor: 'text-emerald-800',
        textColor: 'text-emerald-700',
      };
    case 'error':
      return {
        icon: XCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        iconColor: 'text-amber-500',
        titleColor: 'text-amber-800',
        textColor: 'text-amber-700',
      };
    case 'info':
      return {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-800',
        textColor: 'text-blue-700',
      };
  }
};

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  children,
  onClose,
  className = '',
}) => {
  const config = getAlertConfig(variant);
  const { icon: Icon } = config;

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} border rounded-lg p-4
        ${className}
      `}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleColor}`}>
              {title}
            </h3>
          )}
          <div className={`${title ? 'mt-2' : ''} text-sm ${config.textColor}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`
                  inline-flex rounded-md p-1.5 ${config.iconColor} hover:${config.bgColor}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${variant}-50 focus:ring-${variant}-600
                `}
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};