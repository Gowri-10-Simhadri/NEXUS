import React from 'react';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'violet',
  size = 'sm',
  className = '',
}) => {
  const variantClasses = {
    violet: 'bg-accent-violet/15 text-accent-violet border-accent-violet/30',
    cyan: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30',
    emerald: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30',
    amber: 'bg-accent-amber/15 text-accent-amber border-accent-amber/30',
    rose: 'bg-accent-rose/15 text-accent-rose border-accent-rose/30',
    neutral: 'bg-white/10 light:bg-black/10 text-slate-300 light:text-slate-700 border-white/15 light:border-black/15',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
