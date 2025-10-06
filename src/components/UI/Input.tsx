import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  requiredIndicator?: boolean;
  inline?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className,
  id,
  required,
  requiredIndicator,
  inline = false,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('w-full', inline && 'flex items-center gap-4')} {...(inline ? { role: 'group' } : {})}>
      {label && (
        <label
          htmlFor={inputId}
          className={clsx('text-sm font-medium text-gray-700 dark:text-gray-950 mb-1', inline && 'mb-0 min-w-[140px]')}
        >
          <span>{label}</span>
          {(required || requiredIndicator) && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">{icon}</div>
          </div>
        )}
        <input
          id={inputId}
          required={required}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={clsx(
            'block w-full border rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus-border-transparent transition-colors',
            'bg-white dark:bg-[var(--color-surface)] border-gray-300 dark:border-gray-600 focus:ring-primary-500',
            icon && 'pl-10',
            error && 'border-danger-400 focus:ring-danger-500',
            className
          )}
          {...(error ? { 'aria-invalid': 'true' } : {})}
          {...(props.disabled ? { 'aria-disabled': 'true' } : {})}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-danger-600" aria-live="polite">{error}</p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};