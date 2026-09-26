import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  glow?: 'violet' | 'cyan' | 'amber' | 'rose' | 'none';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  interactive = false,
  glow = 'none',
  className = '',
  ...props
}) => {
  const glowClasses = {
    violet: 'hover:border-accent-violet/40 hover:shadow-glass-glow',
    cyan: 'hover:border-accent-cyan/40 hover:shadow-glass-cyan',
    amber: 'hover:border-accent-amber/40',
    rose: 'hover:border-accent-rose/40',
    none: '',
  };

  return (
    <div
      className={`rounded-2xl backdrop-blur-glass border border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-nexus-800/60 text-slate-800 dark:text-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-glass transition-all duration-300 ${
        interactive ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''
      } ${glowClasses[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
