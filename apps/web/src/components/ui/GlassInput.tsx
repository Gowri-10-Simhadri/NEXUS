import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-300 light:text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl bg-nexus-900/60 dark:bg-nexus-900/60 light:bg-slate-50/90 backdrop-blur-md border ${
            error ? 'border-accent-rose' : 'border-white/10 light:border-black/10'
          } ${
            icon ? 'pl-10' : 'pl-4'
          } pr-4 py-2.5 text-sm text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-violet/50 focus:border-accent-violet transition-all ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-accent-rose font-medium">{error}</p>}
    </div>
  );
};

interface GlassTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const GlassTextArea: React.FC<GlassTextAreaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-300 light:text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-xl bg-nexus-900/60 dark:bg-nexus-900/60 light:bg-slate-50/90 backdrop-blur-md border ${
          error ? 'border-accent-rose' : 'border-white/10 light:border-black/10'
        } px-4 py-2.5 text-sm text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-violet/50 focus:border-accent-violet transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-accent-rose font-medium">{error}</p>}
    </div>
  );
};
