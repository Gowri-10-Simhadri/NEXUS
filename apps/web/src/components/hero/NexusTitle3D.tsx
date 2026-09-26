import React, { useEffect, useRef, useState } from 'react';
import { NexusLogo } from '../ui/NexusLogo.js';

interface NexusTitle3DProps {
  className?: string;
}

export const NexusTitle3D: React.FC<NexusTitle3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, translateZ: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      // Subtle, premium 3D tilt
      setTransform({
        rotateX: -deltaY * 9,
        rotateY: deltaX * 11,
        translateZ: 18,
      });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setTransform({ rotateX: 0, rotateY: 0, translateZ: 0 });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const node = containerRef.current;
    if (node) {
      window.addEventListener('mousemove', handleMouseMove);
      node.addEventListener('mouseenter', handleMouseEnter);
      node.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (node) {
        node.removeEventListener('mouseenter', handleMouseEnter);
        node.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center gap-4 sm:gap-6 md:gap-8 select-none py-4 px-2 ${className}`}
      style={{
        perspective: '1200px',
      }}
    >
      {/* 1. Official NEXUS Logo Placed Immediately to the LEFT of the Title */}
      <div
        className="shrink-0 flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${transform.rotateX * 1.2}deg) rotateY(${transform.rotateY * 1.2}deg) translateZ(36px) ${isHovered ? 'scale(1.08)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 12px 28px rgba(139, 92, 246, 0.35))',
        }}
      >
        <div className="w-16 h-16 sm:w-22 sm:h-22 md:w-28 md:h-28 lg:w-32 lg:h-32">
          <NexusLogo showWordmark={false} size="xl" className="w-full h-full" />
        </div>
      </div>

      {/* 2. Advanced 3D Extruded NEXUS Wordmark on the RIGHT */}
      <div
        className="relative flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translateZ(${transform.translateZ}px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Ambient Chromatic Glow Behind Text */}
        <div
          className="pointer-events-none absolute -inset-6 bg-gradient-to-r from-violet-400/20 via-cyan-400/20 to-pink-400/20 rounded-full blur-2xl opacity-75"
          style={{ transform: 'translateZ(-20px)' }}
        />

        {/* 3D Extruded Deep Charcoal / Navy Front Text */}
        <h1
          className="font-display font-black tracking-tight text-[4rem] sm:text-[6rem] md:text-[7.8rem] lg:text-[9.2rem] leading-none"
          style={{
            transformStyle: 'preserve-3d',
            color: '#0f172a',
            textShadow: `
              0 1px 0 #cbd5e1,
              0 2px 0 #94a3b8,
              0 3px 0 #64748b,
              0 4px 0 #475569,
              0 5px 0 #334155,
              0 6px 1px rgba(15, 23, 42, 0.15),
              0 10px 24px rgba(139, 92, 246, 0.2),
              0 20px 40px rgba(6, 182, 212, 0.15)
            `,
            letterSpacing: '-0.02em',
          }}
        >
          NEXUS
        </h1>
      </div>
    </div>
  );
};
