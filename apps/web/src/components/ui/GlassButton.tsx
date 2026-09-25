import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-accent-violet to-accent-purple text-white shadow-lg shadow-accent-violet/25 hover:shadow-accent-violet/40 hover:opacity-95 border border-white/10 active:scale-[0.98]',
    cyan:
      'bg-gradient-to-r from-accent-cyan to-blue-600 text-white shadow-lg shadow-accent-cyan/25 hover:shadow-accent-cyan/40 hover:opacity-95 border border-white/10 active:scale-[0.98]',
    secondary:
      'bg-nexus-700/60 dark:bg-nexus-700/60 light:bg-slate-200/80 text-slate-100 light:text-slate-800 border border-white/10 light:border-black/10 hover:bg-nexus-600/70 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-300 light:text-slate-600 hover:bg-white/[0.06] light:hover:bg-black/[0.06] active:scale-[0.98]',
    danger:
      'bg-accent-rose/20 text-accent-rose border border-accent-rose/30 hover:bg-accent-rose/30 active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-violet/40 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
