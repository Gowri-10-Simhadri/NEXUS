import React from 'react';

interface NexusLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  darkWordmark?: boolean;
}

export const NexusLogo: React.FC<NexusLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-base font-extrabold tracking-widest' },
    md: { icon: 'w-8 h-8', text: 'text-xl font-extrabold tracking-widest' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl font-extrabold tracking-wider' },
    xl: { icon: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', text: 'text-3xl sm:text-4xl font-black tracking-tight' },
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 1. Official NEXUS Logo Vector Emblem on the LEFT */}
      <div className={`relative ${icon} shrink-0 aspect-square flex items-center justify-center`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_16px_rgba(139,92,246,0.35)]"
        >
          <defs>
            <linearGradient id="logoG1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="logoG2" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Connected Outer Energy Ring */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="url(#logoG1)"
            strokeWidth="2.5"
            strokeDasharray="80 30"
            strokeLinecap="round"
            className="animate-spin-neural origin-center opacity-85"
          />

          {/* Hexagonal Cognitive Vault */}
          <path
            d="M24 8L38 16V32L24 40L10 32V16L24 8Z"
            stroke="url(#logoG1)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="#0f172a"
            fillOpacity="0.85"
          />

          {/* Synapse Lines */}
          <line x1="24" y1="14" x2="24" y2="34" stroke="url(#logoG1)" strokeWidth="2" strokeLinecap="round" />
          <line x1="15" y1="20" x2="33" y2="28" stroke="url(#logoG1)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="15" y1="28" x2="33" y2="20" stroke="url(#logoG1)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

          {/* Central Neural Pulse */}
          <circle cx="24" cy="24" r="4.5" fill="url(#logoG2)" />
          <circle cx="24" cy="24" r="2" fill="#ffffff" />

          {/* Orbital Nodes */}
          <circle cx="24" cy="8" r="2.5" fill="#8b5cf6" />
          <circle cx="38" cy="16" r="2" fill="#06b6d4" />
          <circle cx="38" cy="32" r="2" fill="#10b981" />
          <circle cx="24" cy="40" r="2" fill="#8b5cf6" />
          <circle cx="10" cy="32" r="2" fill="#06b6d4" />
          <circle cx="10" cy="16" r="2" fill="#ec4899" />
        </svg>
      </div>

      {/* 2. Bold, Dark High-Contrast Brand Wordmark on the RIGHT */}
      {showWordmark && (
        <span
          className={`font-display ${text} text-slate-900 dark:text-white leading-none tracking-tight`}
          style={{
            letterSpacing: '0.08em',
          }}
        >
          NEXUS
        </span>
      )}
    </div>
  );
};
