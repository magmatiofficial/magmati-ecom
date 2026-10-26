import React from 'react';

export function CategoryPageClientSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-zinc-200 animate-pulse" />
      ))}
    </div>
  );
}
