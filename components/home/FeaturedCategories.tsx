/**
 * @file components/home/FeaturedCategories.tsx
 * @description Popular Categories row. Clean circular category presentation.
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { CategoryItem } from '@/types';
import { FeaturedCategoriesSkeleton } from '@/components/skeletons/FeaturedCategoriesSkeleton';

// Auto-slide interval in ms. Keep in sync with the hero banner (4s).
const AUTO_SLIDE_MS = 4000;

export interface FeaturedCategoriesProps {
  categories: CategoryItem[];
  isLoading?: boolean;
  preset?: string;
  title?: string;
  subtitle?: string;
  bgColor?: string;
}

export function FeaturedCategories({ 
  categories, 
  isLoading = false,
  preset: _preset,
  title,
  subtitle: _subtitle,
  bgColor,
}: FeaturedCategoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isLoading || isPaused || !categories || categories.length === 0) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      const el = scrollRef.current;
      if (!el || el.scrollWidth <= el.clientWidth + 2) return;
      const first = el.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const step = first ? first.getBoundingClientRect().width + gap : el.clientWidth / 3;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: 'smooth' });
    }, AUTO_SLIDE_MS);
    return () => window.clearInterval(id);
  }, [isLoading, isPaused, categories]);

  const displayTitle = title || 'Popular Categories';

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!isLoading && (!categories || categories.length === 0)) {
    return null;
  }

  return (
    <section 
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-3 sm:pt-2 sm:pb-4"
    >
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-900">
            {displayTitle}
          </h2>

          {/* Action Controls: View All Link + Nav Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/category"
              className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline"
            >
              <span>{'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
              className="hidden md:flex w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/80 shadow-2xs items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
              className="hidden md:flex w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/80 shadow-2xs items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Track */}
        <div 
          ref={scrollRef}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') setIsPaused(true); }}
          onPointerLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex items-center gap-3 sm:gap-4 md:gap-4 lg:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2.5 no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {isLoading ? (
            <FeaturedCategoriesSkeleton />
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center shrink-0 w-[calc((100%-2.25rem)/3.5)] sm:w-[calc((100%-5rem)/5.5)] md:w-[calc((100%-6rem)/6.5)] lg:w-[calc((100%-14rem)/7.5)] xl:w-[calc((100%-16rem)/8.5)] snap-start bg-surface border border-border shadow-2xs rounded-2xl p-1.5 sm:p-2 transition-colors duration-200 hover:border-primary/40 cursor-pointer focus:outline-hidden"
              >
                <div className="w-full aspect-square relative overflow-hidden rounded-xl bg-surface-subtle">
                  <Image
                    src={cat.image || '/placeholder-category.svg'}
                    alt={cat.name}
                    fill
                    sizes="(min-width: 1280px) 140px, (min-width: 1024px) 12vw, (min-width: 768px) 128px, (min-width: 640px) 112px, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="mt-1.5 w-full min-h-[2.4em] text-2xs lg:text-xs font-semibold text-text-main text-center leading-tight line-clamp-2 break-words">
                  {cat.name}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
