import React from 'react';

export function ProductPageClientSkeleton() {
  return (
    <div className="min-h-screen bg-app-bg pb-24 lg:pb-16">
      <div className="hidden sm:block bg-white border-b border-zinc-200/90 py-3"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-4 w-56 rounded bg-zinc-200 animate-pulse" /></div></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-8 items-start">
          <div className="lg:col-span-7"><div className="aspect-square max-h-[50dvh] w-full lg:aspect-auto lg:h-[calc(100dvh-9rem)] lg:min-h-[480px] lg:max-h-[720px] rounded-2xl bg-zinc-200 animate-pulse" /></div>
          <div className="lg:col-span-5 space-y-3">
            <div className="h-5 w-3/4 rounded bg-zinc-200 animate-pulse" />
            <div className="h-5 w-1/3 rounded bg-zinc-200 animate-pulse" />
            <div className="h-14 w-full rounded-lg bg-zinc-200 animate-pulse" />
            <div className="h-8 w-full rounded-lg bg-zinc-200 animate-pulse" />
            <div className="h-8 w-full rounded-lg bg-zinc-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
