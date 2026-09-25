import React from 'react';

interface GlassSkeletonProps {
  className?: string;
}

export const GlassSkeleton: React.FC<GlassSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.06] light:bg-black/[0.06] ${className}`}
    />
  );
};

export const GlassSkeletonCard: React.FC = () => {
  return (
    <div className="rounded-2xl p-6 border border-white/[0.06] bg-nexus-800/40 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <GlassSkeleton className="h-6 w-1/3" />
        <GlassSkeleton className="h-5 w-16 rounded-full" />
      </div>
      <GlassSkeleton className="h-4 w-3/4" />
      <GlassSkeleton className="h-4 w-1/2" />
      <div className="pt-2 flex items-center justify-between">
        <GlassSkeleton className="h-4 w-24" />
        <GlassSkeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
};
