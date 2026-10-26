/**
 * @file components/home/FlashDeals.tsx
 * @description Harmonious, space-efficient Flash Sale section.
 * Coordinated with the MAGMATI brand palette:
 * - Crisp elevated card with subtle brand crimson (#D12929) accent
 * - Compact inline header integrating the Flash Sale badge directly with live countdown timer
 * - Tightly aligned product cards with consistent grid spacing
 * - Clear, consistent CTA button redirecting to Best Deals showcase
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Zap, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { ProductCardSlot } from '@/components/product/ProductCardSlot';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export interface FlashDealsProps {
  products: Product[];
  isLoading?: boolean;
  preset?: string;
  title?: string;
  subtitle?: string;
  bgColor?: string;
}

export const FlashDeals = React.memo(function FlashDeals({ 
  products,
  isLoading = false,
  title,
  subtitle,
  bgColor,
}: FlashDealsProps) {
  const siteSettings = useSiteSettings();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const displayTitle = ((title || siteSettings.flashSaleTitle)) || ('FLASH SALE');
  const displaySubtitle = ((subtitle || siteSettings.flashSaleSubtitle)) || ('Up to 50% Off');

  // Live countdown state calculated from siteSettings or fallback
  const [timeLeft, setTimeLeft] = useState({
    hours: siteSettings.flashSaleDurationHours || 24,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // If a target end time string exists, calculate remaining time
    if (siteSettings.flashSaleEndTime) {
      const targetDate = new Date(siteSettings.flashSaleEndTime).getTime();
      const updateCountdown = () => {
        const now = new Date().getTime();
        const diff = Math.max(0, targetDate - now);
        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          return;
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }

    // Fallback relative timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: siteSettings.flashSaleDurationHours || 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [siteSettings.flashSaleEndTime, siteSettings.flashSaleDurationHours]);

  const formatDigit = (num: number) => String(num).padStart(2, '0');

  // Flash products slice (first 10 items)
  const flashProducts = (products || []).filter((p) => p.isFlashDeal).slice(0, 10);
  const displayList = flashProducts.length > 0 ? flashProducts : (products || []).slice(0, 10);

  return (
    <section 
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 font-sans"
    >
      {/* Elevated, ultra-clean Flash Sale Container */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#4A030F] bg-[url('/images/magmati-flash-sale-banner-bg.png')] bg-cover bg-center bg-no-repeat p-3 sm:p-5 lg:p-6 shadow-xs">
        
        {/* Responsive Header Section */}
        <div className="mb-3 sm:mb-4 pb-1">
          
          {/* Mobile Header Layout (2 Rows: Row 1 = Title + View All, Row 2 = Timer) */}
          <div className="flex sm:hidden flex-col gap-2.5">
            {/* Top Row: Title & View All */}
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2.5 min-w-0">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-brand-gold animate-pulse shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xl sm:text-3xl font-black tracking-tight uppercase text-white leading-none drop-shadow-sm truncate">{displayTitle}</span>
                  <span className="block mt-1 text-2xs sm:text-xs font-semibold text-white/80 truncate">{displaySubtitle}</span>
                </div>
              </div>

              <Link
                href="/best-deals"
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 border border-white/25 text-white hover:bg-white hover:text-primary text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs shrink-0"
              >
                <span>{'View All'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Bottom Row: Centered Timer */}
            <div className="flex items-center justify-center w-full py-1">
              <div className="inline-flex items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1 text-2xs sm:text-xs font-bold uppercase tracking-wide text-white/80">
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  {'ENDS IN'}
                </span>

                <div className="flex flex-col items-center">
                  <span className="min-w-[2.25rem] sm:min-w-[3rem] text-center rounded-lg bg-black/30 border border-white/15 px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-lg sm:text-2xl font-black font-mono tabular-nums text-white">
                    {formatDigit(timeLeft.hours)}
                  </span>
                  <span className="mt-0.5 text-2xs font-bold uppercase tracking-wide text-white/70">HRS</span>
                </div>

                <span className="text-white/70 font-black text-lg sm:text-2xl leading-none self-start mt-1">:</span>

                <div className="flex flex-col items-center">
                  <span className="min-w-[2.25rem] sm:min-w-[3rem] text-center rounded-lg bg-black/30 border border-white/15 px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-lg sm:text-2xl font-black font-mono tabular-nums text-white">
                    {formatDigit(timeLeft.minutes)}
                  </span>
                  <span className="mt-0.5 text-2xs font-bold uppercase tracking-wide text-white/70">MIN</span>
                </div>

                <span className="text-white/70 font-black text-lg sm:text-2xl leading-none self-start mt-1">:</span>

                <div className="flex flex-col items-center">
                  <span className="min-w-[2.25rem] sm:min-w-[3rem] text-center rounded-lg bg-brand-gold text-zinc-900 border border-brand-gold px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-lg sm:text-2xl font-black font-mono tabular-nums animate-pulse">
                    {formatDigit(timeLeft.seconds)}
                  </span>
                  <span className="mt-0.5 text-2xs font-bold uppercase tracking-wide text-white/70">SEC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Header Layout (Single Clean Row) */}
          <div className="hidden sm:flex items-center justify-between gap-3">
            <div className="flex items-center gap-6">
              <div className="inline-flex items-center gap-2.5 min-w-0">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-brand-gold animate-pulse shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xl sm:text-3xl font-black tracking-tight uppercase text-white leading-none drop-shadow-sm truncate">{displayTitle}</span>
                  <span className="block mt-1 text-2xs sm:text-xs font-semibold text-white/80 truncate">{displaySubtitle}</span>
                </div>
              </div>

              {/* Inline Countdown Timer */}
              <div className="inline-flex items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1 text-2xs sm:text-xs font-bold uppercase tracking-wide text-white/80">
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  {'ENDS IN'}
                </span>

                <div className="flex flex-col items-center">
                  <span className="min-w-[2.25rem] sm:min-w-[3rem] text-center rounded-lg bg-black/30 border border-white/15 px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-lg sm:text-2xl font-black font-mono tabular-nums text-white">
                    {formatDigit(timeLeft.hours)}
                  </span>
                  <span className="mt-0.5 text-2xs font-bold uppercase tracking-wide text-white/70">HRS</span>
                </div>

                <span className="text-white/70 font-black text-lg sm:text-2xl leading-none self-start mt-1">:</span>

                <div className="flex flex-col items-center">
                  <span className="min-w-[2.25rem] sm:min-w-[3rem] text-center rounded-lg bg-black/30 border border-white/15 px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-lg sm:text-2xl font-black font-mono tabular-nums text-white">
                    {formatDigit(timeLeft.minutes)}
                  </span>
                  <span className="mt-0.5 text-2xs font-bold uppercase tracking-wide text-white/70">MIN</span>
                </div>

                <span className="text-white/70 font-black text-lg sm:text-2xl leading-none self-start mt-1">:</span>

                <div className="flex flex-col items-center">
                  <span className="min-w-[2.25rem] sm:min-w-[3rem] text-center rounded-lg bg-brand-gold text-zinc-900 border border-brand-gold px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-lg sm:text-2xl font-black font-mono tabular-nums animate-pulse">
                    {formatDigit(timeLeft.seconds)}
                  </span>
                  <span className="mt-0.5 text-2xs font-bold uppercase tracking-wide text-white/70">SEC</span>
                </div>
              </div>
            </div>

            <Link
              href="/best-deals"
              className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/25 text-white hover:bg-white hover:text-primary text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs"
            >
              <span>{'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Compact Single-Row Carousel */}
        {isLoading || displayList.length === 0 ? (
          <div className="py-8 flex items-center justify-center col-span-full">
            <LoadingSpinner size="sm" text={'Loading flash deals...'} />
          </div>
        ) : (
          <div className="relative md:px-12">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-lg bg-white text-primary border border-zinc-200 ring-4 ring-primary/10 shadow-card hover:bg-primary hover:text-white hover:border-primary hover:ring-primary/20 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.75]" />
            </button>

            <div
              ref={scrollRef}
              className="flex flex-row overflow-x-auto gap-3 sm:gap-4 pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
            >
              {displayList.map((product) => (
                <ProductCardSlot key={product.id} product={product} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-lg bg-white text-primary border border-zinc-200 ring-4 ring-primary/10 shadow-card hover:bg-primary hover:text-white hover:border-primary hover:ring-primary/20 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.75]" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
});

