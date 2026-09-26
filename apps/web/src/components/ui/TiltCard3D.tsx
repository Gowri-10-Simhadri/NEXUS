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
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate rotation (-12 to +12 degrees max)
    const rotateX = ((mouseY / height) - 0.5) * -16;
    const rotateY = ((mouseX / width) - 0.5) * 16;

    // Calculate glare position
    const glareX = (mouseX / width) * 100;
    const glareY = (mouseY / height) * 100;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  // Coordinated palette styling per accent
  const accentStyles = {
    cyan: {
      bgGlow: 'bg-cyan-500/10',
      borderHover: 'hover:border-cyan-400/50',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
      highlight: 'from-cyan-400/15 via-blue-500/5 to-transparent',
      shadow: 'hover:shadow-[0_20px_40px_-12px_rgba(6,182,212,0.22)]',
    },
    violet: {
      bgGlow: 'bg-violet-500/10',
      borderHover: 'hover:border-violet-400/50',
      iconBg: 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25',
      badgeBg: 'bg-violet-50 text-violet-700 border-violet-200/80',
      highlight: 'from-violet-400/15 via-purple-500/5 to-transparent',
      shadow: 'hover:shadow-[0_20px_40px_-12px_rgba(139,92,246,0.22)]',
    },
    pink: {
      bgGlow: 'bg-pink-500/10',
      borderHover: 'hover:border-pink-400/50',
      iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25',
      badgeBg: 'bg-pink-50 text-pink-700 border-pink-200/80',
      highlight: 'from-pink-400/15 via-rose-500/5 to-transparent',
      shadow: 'hover:shadow-[0_20px_40px_-12px_rgba(236,72,153,0.22)]',
    },
    teal: {
      bgGlow: 'bg-emerald-500/10',
      borderHover: 'hover:border-emerald-400/50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      highlight: 'from-emerald-400/15 via-teal-500/5 to-transparent',
      shadow: 'hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.22)]',
    },
    orange: {
      bgGlow: 'bg-amber-500/10',
      borderHover: 'hover:border-amber-400/50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      highlight: 'from-amber-400/15 via-orange-500/5 to-transparent',
      shadow: 'hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.22)]',
    },
    indigo: {
      bgGlow: 'bg-indigo-500/10',
      borderHover: 'hover:border-indigo-400/50',
      iconBg: 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/25',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      highlight: 'from-indigo-400/15 via-blue-600/5 to-transparent',
      shadow: 'hover:shadow-[0_20px_40px_-12px_rgba(99,102,241,0.22)]',
    },
  };

  const style = accentStyles[accent] || accentStyles.cyan;

  return (
    <div
      style={{ perspective: '1000px' }}
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
            isHovered ? 'translateZ(12px)' : 'translateZ(0px)'
          }`,
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.1s ease-out, box-shadow 0.25s ease'
            : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease',
        }}
        className={`relative overflow-hidden rounded-3xl bg-white/80 dark:bg-nexus-850/80 border border-slate-200/80 dark:border-white/10 p-7 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${style.borderHover} ${style.shadow} ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
      >
        {/* Decorative ambient gradient backdrop */}
        <div
          className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${style.highlight} blur-2xl transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-60'
          }`}
        />

        {/* Dynamic Interactive Cursor Glare */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}), transparent 70%)`,
          }}
        />

        {/* Card Header & Content Layers */}
        <div className="relative z-10 space-y-4">
          {/* Top Row: Icon + Badge with translateZ depth */}
          <div className="flex items-center justify-between">
            <div
              style={{ transform: 'translateZ(28px)' }}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.iconBg} transition-transform duration-300`}
            >
              {icon}
            </div>

            {badge && (
              <span
                style={{ transform: 'translateZ(18px)' }}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${style.badgeBg}`}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Title with translateZ depth */}
          <h3
            style={{ transform: 'translateZ(24px)' }}
            className="text-lg font-bold font-display text-slate-800 dark:text-slate-100 tracking-tight"
          >
            {title}
          </h3>

          {/* Description with translateZ depth */}
          <p
            style={{ transform: 'translateZ(14px)' }}
            className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
          >
            {description}
          </p>

          {/* Custom child elements (e.g. progress bar, callout) */}
          {children && (
            <div style={{ transform: 'translateZ(16px)' }} className="pt-1">
              {children}
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        {action && (
          <div
            style={{ transform: 'translateZ(26px)' }}
            className="relative z-10 mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06]"
          >
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
