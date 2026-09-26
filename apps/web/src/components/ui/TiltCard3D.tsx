import React, { useRef, useState } from 'react';

export type CardAccentColor = 'cyan' | 'violet' | 'pink' | 'teal' | 'orange' | 'indigo';

interface TiltCard3DProps {
  accent: CardAccentColor;
  icon: React.ReactNode;
  badge?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  accent = 'cyan',
  icon,
  badge,
  title,
  description,
  children,
  action,
  className = '',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate rotation (-14 to +14 deg)
    const rotateX = ((mouseY / rect.height) - 0.5) * -18;
    const rotateY = ((mouseX / rect.width) - 0.5) * 18;

    // Calculate glare position
    const glareX = (mouseX / rect.width) * 100;
    const glareY = (mouseY / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.35 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  // Coordinated palette styling per logo-inspired accent
  const accentStyles = {
    cyan: {
      borderHover: 'hover:border-cyan-400',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30',
      badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200 font-bold',
      highlight: 'from-cyan-400/20 via-blue-400/10 to-transparent',
      shadow: 'hover:shadow-[0_24px_48px_-12px_rgba(6,182,212,0.3)]',
      glareColor: 'rgba(6, 182, 212, 0.25)',
    },
    violet: {
      borderHover: 'hover:border-violet-400',
      iconBg: 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30',
      badgeBg: 'bg-violet-50 text-violet-800 border-violet-200 font-bold',
      highlight: 'from-violet-400/20 via-purple-400/10 to-transparent',
      shadow: 'hover:shadow-[0_24px_48px_-12px_rgba(139,92,246,0.3)]',
      glareColor: 'rgba(139, 92, 246, 0.25)',
    },
    pink: {
      borderHover: 'hover:border-pink-400',
      iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30',
      badgeBg: 'bg-pink-50 text-pink-800 border-pink-200 font-bold',
      highlight: 'from-pink-400/20 via-rose-400/10 to-transparent',
      shadow: 'hover:shadow-[0_24px_48px_-12px_rgba(236,72,153,0.3)]',
      glareColor: 'rgba(236, 72, 153, 0.25)',
    },
    teal: {
      borderHover: 'hover:border-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
      highlight: 'from-emerald-400/20 via-teal-400/10 to-transparent',
      shadow: 'hover:shadow-[0_24px_48px_-12px_rgba(16,185,129,0.3)]',
      glareColor: 'rgba(16, 185, 129, 0.25)',
    },
    orange: {
      borderHover: 'hover:border-amber-400',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
      highlight: 'from-amber-400/20 via-orange-400/10 to-transparent',
      shadow: 'hover:shadow-[0_24px_48px_-12px_rgba(245,158,11,0.3)]',
      glareColor: 'rgba(245, 158, 11, 0.25)',
    },
    indigo: {
      borderHover: 'hover:border-indigo-400',
      iconBg: 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-500/30',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold',
      highlight: 'from-indigo-400/20 via-blue-400/10 to-transparent',
      shadow: 'hover:shadow-[0_24px_48px_-12px_rgba(99,102,241,0.3)]',
      glareColor: 'rgba(99, 102, 241, 0.25)',
    },
  };

  const style = accentStyles[accent] || accentStyles.cyan;

  return (
    <div
      style={{ perspective: '1200px' }}
      className="w-full transition-transform duration-300"
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${
            isHovered ? 'translateZ(16px) scale(1.02)' : 'translateZ(0px)'
          }`,
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.08s ease-out, box-shadow 0.2s ease'
            : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease',
        }}
        className={`relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${style.borderHover} ${style.shadow} ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
      >
        {/* Layer 2: Decorative Gradient Aura */}
        <div
          style={{ transform: 'translateZ(-10px)' }}
          className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br ${style.highlight} blur-3xl transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-60'
          }`}
        />

        {/* Dynamic Cursor Glare Reflection */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle 320px at ${glare.x}% ${glare.y}%, ${style.glareColor}, transparent 75%)`,
            opacity: glare.opacity,
          }}
        />

        {/* Layered Content System */}
        <div className="relative z-10 space-y-4" style={{ transformStyle: 'preserve-3d' }}>
          {/* Top Row: Icon (Layer 4: translateZ 38px) + Badge (Layer 3: translateZ 24px) */}
          <div className="flex items-center justify-between">
            <div
              style={{ transform: 'translateZ(38px)' }}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${style.iconBg} transition-transform duration-300 shadow-md`}
            >
              {icon}
            </div>

            {badge && (
              <span
                style={{ transform: 'translateZ(24px)' }}
                className={`rounded-full border px-3.5 py-1 text-[11px] uppercase tracking-wider ${style.badgeBg}`}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Title (Layer 5: translateZ 48px) - Bold, Dark High Contrast */}
          <h3
            style={{ transform: 'translateZ(48px)' }}
            className="text-xl font-bold font-display text-slate-900 tracking-tight leading-snug pt-1"
          >
            {title}
          </h3>

          {/* Description (Layer 6: translateZ 28px) - Crisp Dark Charcoal */}
          <p
            style={{ transform: 'translateZ(28px)' }}
            className="text-sm text-slate-600 leading-relaxed font-normal"
          >
            {description}
          </p>

          {children && (
            <div style={{ transform: 'translateZ(32px)' }} className="pt-2">
              {children}
            </div>
          )}
        </div>

        {/* Action Button (Layer 7: translateZ 58px) */}
        {action && (
          <div
            style={{ transform: 'translateZ(58px)' }}
            className="relative z-10 mt-6 pt-4 border-t border-slate-100"
          >
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
