import React from 'react';

export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden glass-panel border border-white/5 animate-pulse">
      <div className="aspect-[3/4] bg-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="flex justify-between items-center">
          <div className="h-3 bg-white/5 rounded w-1/4" />
          <div className="h-3 bg-white/5 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonEpisode() {
  return (
    <div className="rounded-xl overflow-hidden glass-card animate-pulse border border-white/5">
      <div className="aspect-video bg-white/5 relative" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="w-full min-h-[70vh] lg:h-[80vh] flex items-center justify-center bg-[#06060c] animate-pulse">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 py-20">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-12 bg-white/10 rounded w-2/3" />
          <div className="space-y-2">
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-5/6" />
            <div className="h-4 bg-white/5 rounded w-4/5" />
          </div>
          <div className="flex gap-4 pt-4">
            <div className="h-12 bg-white/10 rounded-lg w-32" />
            <div className="h-12 bg-white/10 rounded-lg w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonDetails() {
  return (
    <div className="min-h-screen bg-[#05050a] animate-pulse pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cover poster skeleton */}
          <div className="lg:col-span-4 aspect-[3/4] bg-white/5 rounded-2xl border border-white/5" />
          
          {/* Metadata skeleton */}
          <div className="lg:col-span-8 space-y-6">
            <div className="h-10 bg-white/10 rounded w-2/3" />
            <div className="h-5 bg-white/5 rounded w-1/3" />
            <div className="space-y-3 py-4 border-y border-white/5">
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-5/6" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-8 bg-white/5 rounded w-3/4" />
              <div className="h-8 bg-white/5 rounded w-1/2" />
              <div className="h-8 bg-white/5 rounded w-2/3" />
              <div className="h-8 bg-white/5 rounded w-3/4" />
            </div>
          </div>
        </div>

        {/* Episodes header skeleton */}
        <div className="space-y-4 pt-12">
          <div className="h-8 bg-white/10 rounded w-40" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-10 bg-white/5 rounded-lg border border-white/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  if (type === 'hero') return <SkeletonHero />;
  if (type === 'details') return <SkeletonDetails />;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        type === 'episode' ? <SkeletonEpisode key={i} /> : <SkeletonCard key={i} />
      ))}
    </div>
  );
}
