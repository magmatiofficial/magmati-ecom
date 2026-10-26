import React from 'react';

export function FeaturedCategoriesSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center shrink-0 w-[calc((100%-2.25rem)/3.5)] sm:w-[calc((100%-5rem)/5.5)] md:w-[calc((100%-6rem)/6.5)] lg:w-[calc((100%-14rem)/7.5)] xl:w-[calc((100%-16rem)/8.5)] bg-surface border border-border rounded-2xl p-1.5 sm:p-2"
          aria-hidden="true"
        >
          <div className="w-full aspect-square rounded-xl bg-surface-subtle animate-pulse" />
          <div className="mt-1.5 h-3 w-3/4 rounded bg-surface-subtle animate-pulse" />
        </div>
      ))}
    </>
  );
}
