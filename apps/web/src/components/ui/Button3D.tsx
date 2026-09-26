import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'cyan' | 'violet' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
}

export const Button3D: React.FC<Button3DProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconRight,
  className = '',
  disabled,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Mild tactile 3D tilt
    setRotate({
      x: -y * 0.12,
      y: x * 0.12,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-3 font-semibold',
    xl: 'px-8 py-4 text-lg rounded-2xl gap-3.5 font-bold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white border-t border-white/30 shadow-[0_8px_20px_-4px_rgba(124,58,237,0.45),0_4px_8px_-2px_rgba(124,58,237,0.3)] hover:shadow-[0_14px_28px_-4px_rgba(124,58,237,0.55),0_6px_12px_-2px_rgba(124,58,237,0.35)]',
    cyan:
      'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white border-t border-white/30 shadow-[0_8px_20px_-4px_rgba(6,182,212,0.45),0_4px_8px_-2px_rgba(6,182,212,0.3)] hover:shadow-[0_14px_28px_-4px_rgba(6,182,212,0.55),0_6px_12px_-2px_rgba(6,182,212,0.35)]',
    violet:
      'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white border-t border-white/30 shadow-[0_8px_20px_-4px_rgba(236,72,153,0.45),0_4px_8px_-2px_rgba(236,72,153,0.3)] hover:shadow-[0_14px_28px_-4px_rgba(236,72,153,0.55),0_6px_12px_-2px_rgba(236,72,153,0.35)]',
    secondary:
      'bg-white/90 text-slate-800 border border-slate-200/80 shadow-[0_6px_16px_-4px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:bg-slate-50 hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.06)] hover:border-slate-300',
    outline:
      'bg-transparent text-slate-700 border-2 border-slate-300 shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-slate-100/80 hover:border-slate-400 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]',
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || isLoading}
      style={{
        transform: `perspective(600px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.2s ease, background 0.2s ease',
      }}
      className={`group relative inline-flex items-center justify-center select-none active:translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${sizeClasses[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Subtle 3D Top Specular Sheen */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/20 to-transparent opacity-80" />

      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-current" />
      ) : (
        <>
          {icon && (
            <span className="shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5">
              {icon}
            </span>
          )}
          <span className="relative z-10 tracking-tight">{children}</span>
          {iconRight && (
            <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-1">
              {iconRight}
            </span>
          )}
        </>
      )}
    </button>
  );
};
