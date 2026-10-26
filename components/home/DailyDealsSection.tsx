/**
 * @file components/home/DailyDealsSection.tsx
 * @description Daily Deals section with countdown timer, discount badges, stock availability progress bars,
 * fully clickable product cards leading to product details, and consistent Best Deals CTA button labels.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCardSlot, PRODUCT_CARD_SLOT_CLASS } from '@/components/product/ProductCardSlot';

interface DailyDealsSectionProps {
  products: Product[];
  isLoading?: boolean;
  title?: string;
}

export function DailyDealsSection({
  products,
  isLoading,
  title,
}: DailyDealsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  // Countdown timer state (time remaining until next local midnight)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = (products || []).slice(0, 12);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 font-sans">
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-border shadow-sm p-4 sm:p-6 lg:p-8">

        {/* Header: Title + Countdown Timer + Consistent Best Deals CTA */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 sm:mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main">
                {(title) || ('Daily Deals')}
              </h2>
            </div>
          </div>

          {/* Countdown timer blocks */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-muted mr-1 uppercase tracking-wider">
              {'ENDS IN'}
            </span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
              <span className="px-2 py-1 bg-surface text-text-main border border-border rounded-lg shadow-2xs">
                {timeLeft ? String(timeLeft.hours).padStart(2, '0') : '--'}
              </span>
              <span className="text-text-subtle font-bold">:</span>
              <span className="px-2 py-1 bg-surface text-text-main border border-border rounded-lg shadow-2xs">
                {timeLeft ? String(timeLeft.minutes).padStart(2, '0') : '--'}
              </span>
              <span className="text-text-subtle font-bold">:</span>
              <span className="px-2 py-1 bg-surface-dark text-white rounded-lg shadow-2xs animate-pulse">
                {timeLeft ? String(timeLeft.seconds).padStart(2, '0') : '--'}
              </span>
            </div>

            <Link
              href="/best-deals"
              className="ml-2 inline-flex items-center gap-1.5 text-xs font-bold text-text-main bg-surface hover:bg-surface-hover border border-border px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <span>{'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Carousel */}
        {isLoading || dealProducts.length === 0 ? (
          <div className="py-8 flex items-center justify-center col-span-full">
            <div className="flex flex-row overflow-x-auto gap-3 sm:gap-4 w-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`${PRODUCT_CARD_SLOT_CLASS} bg-white rounded-2xl p-3 sm:p-4 shadow-xs space-y-3 shrink-0`}>
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-20 bg-zinc-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="w-full h-40 sm:h-48 rounded-xl bg-zinc-200 animate-pulse" />
                  <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
                  <div className="h-5 w-1/3 bg-zinc-200 rounded animate-pulse" />
                  <div className="h-9 w-full bg-zinc-200 rounded-xl animate-pulse mt-2" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative md:px-12">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white text-primary border border-zinc-200 ring-4 ring-primary/10 shadow-card hover:bg-primary hover:text-white hover:border-primary hover:ring-primary/20 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.75]" />
            </button>

            <div
              ref={scrollRef}
              className="flex flex-row overflow-x-auto gap-3 sm:gap-4 pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
            >
              {dealProducts.map((product) => (
                <ProductCardSlot key={product.id} product={product} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white text-primary border border-zinc-200 ring-4 ring-primary/10 shadow-card hover:bg-primary hover:text-white hover:border-primary hover:ring-primary/20 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.75]" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
