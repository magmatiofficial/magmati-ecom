import React from 'react';

export interface ProductGridSkeletonProps {
  layout?: 'grid' | 'list';
  count?: number;
}

export function ProductGridSkeleton({ layout = 'grid', count = 8 }: ProductGridSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (layout === 'list') {
    return (
      <div className="flex flex-col gap-3.5">
        {items.map((i) => (
          <div key={i} className="h-28 rounded-xl bg-zinc-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5 items-stretch">
      {items.map((i) => (
        <div key={i} className="aspect-[3/4] rounded-xl bg-zinc-200 animate-pulse" />
      ))}
    </div>
  );
}
