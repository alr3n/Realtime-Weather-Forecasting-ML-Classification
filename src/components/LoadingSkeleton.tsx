'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl animate-shimmer bg-white/[0.04] border border-white/5',
        className
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto px-5 pb-nav pt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center gap-5 py-6">
        <Skeleton className="h-40 w-40 rounded-full" />
        <Skeleton className="h-16 w-32" />
        <Skeleton className="h-4 w-44" />
      </div>

      {/* Tab bar */}
      <Skeleton className="h-12 w-full" />

      {/* Hourly pills */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-20 shrink-0" />
        ))}
      </div>

      {/* ML panel */}
      <Skeleton className="h-32 w-full" />

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}
