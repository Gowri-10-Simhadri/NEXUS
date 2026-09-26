import React, { useEffect, useRef } from 'react';
import { NexusLogo } from '../ui/NexusLogo.js';

interface NexusTitle3DProps {
  className?: string;
}

export const NexusTitle3D: React.FC<NexusTitle3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !titleRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      // Smooth subtle 3D tilt
      titleRef.current.style.transform = `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg) translateZ(10px)`;
      if (logoRef.current) {
        logoRef.current.style.transform = `perspective(1000px) rotateX(${-y * 12}deg) rotateY(${x * 14}deg) translateZ(24px) scale(1.05)`;
      }
    };

    const handleMouseLeave = () => {
      if (titleRef.current) {
        titleRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      }
      if (logoRef.current) {
        logoRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
      }
    };

    const node = containerRef.current;
    if (node) {
      window.addEventListener('mousemove', handleMouseMove);
      node.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (node) {
        node.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center gap-3 sm:gap-5 md:gap-7 select-none py-2 px-1 ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* 3D Animated NEXUS Typography */}
      <h1
        ref={titleRef}
        className="font-display font-black tracking-tight text-[3.8rem] sm:text-[5.5rem] md:text-[7.2rem] lg:text-[8.5rem] leading-none transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #4338ca 75%, #0284c7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 10px 30px rgba(67, 56, 202, 0.15)',
          filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.2))',
        }}
      >
        NEXUS
      </h1>

      {/* Official NEXUS Logo Placed Immediately to the Right */}
      <div
        ref={logoRef}
        className="shrink-0 flex items-center justify-center transition-transform duration-200 ease-out"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 drop-shadow-[0_10px_25px_rgba(99,102,241,0.35)]">
          <NexusLogo showWordmark={false} size="xl" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};
