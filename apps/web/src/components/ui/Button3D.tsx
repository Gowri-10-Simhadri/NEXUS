import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'cyan' | 'violet' | 'emerald' | 'outline';
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({
      x: -y * 8,
      y: x * 8,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsPressed(false);
  };

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5 font-bold',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2 font-bold',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-3 font-bold',
    xl: 'px-8 py-4 text-lg rounded-2xl gap-3.5 font-extrabold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white border-t border-white/40 shadow-[0_6px_0_#4c1d95,0_12px_24px_rgba(124,58,237,0.35)] hover:shadow-[0_8px_0_#4c1d95,0_16px_32px_rgba(124,58,237,0.45)] hover:-translate-y-1',
    cyan:
      'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white border-t border-white/40 shadow-[0_6px_0_#0369a1,0_12px_24px_rgba(6,182,212,0.35)] hover:shadow-[0_8px_0_#0369a1,0_16px_32px_rgba(6,182,212,0.45)] hover:-translate-y-1',
    violet:
      'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white border-t border-white/40 shadow-[0_6px_0_#831843,0_12px_24px_rgba(236,72,153,0.35)] hover:shadow-[0_8px_0_#831843,0_16px_32px_rgba(236,72,153,0.45)] hover:-translate-y-1',
    emerald:
      'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white border-t border-white/40 shadow-[0_6px_0_#065f46,0_12px_24px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_0_#065f46,0_16px_32px_rgba(16,185,129,0.45)] hover:-translate-y-1',
    secondary:
      'bg-white text-slate-900 border border-slate-200 shadow-[0_5px_0_#cbd5e1,0_10px_20px_rgba(0,0,0,0.06)] hover:bg-slate-50 hover:shadow-[0_7px_0_#cbd5e1,0_14px_26px_rgba(0,0,0,0.09)] hover:-translate-y-1',
    outline:
      'bg-slate-100/90 text-slate-900 border-2 border-slate-300 shadow-[0_4px_0_#94a3b8,0_8px_16px_rgba(0,0,0,0.04)] hover:bg-white hover:border-slate-400 hover:-translate-y-1',
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled || isLoading}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${
          isPressed ? 'translateY(5px) scale(0.98)' : ''
        }`,
        transition: isPressed
          ? 'transform 0.05s ease, box-shadow 0.05s ease'
          : 'transform 0.2s ease-out, box-shadow 0.2s ease, background 0.2s ease',
      }}
      className={`group relative inline-flex items-center justify-center select-none cursor-pointer focus:outline-none focus:ring-3 focus:ring-violet-500/40 active:shadow-[0_1px_0_currentColor] disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Specular Highlight Top Strip */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/30 to-transparent opacity-80" />

      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-current" />
      ) : (
        <>
          {icon && (
            <span className="shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5">
              {icon}
            </span>
          )}
          {children && <span className="relative z-10 tracking-tight">{children}</span>}
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
