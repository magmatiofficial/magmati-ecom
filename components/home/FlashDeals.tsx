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

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { ProductCard } from '@/components/product/ProductCard';
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
  const siteSettings = useSiteSettingsStore();

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

  // Flash products slice (first 4 items)
  const flashProducts = (products || []).filter((p) => p.isFlashDeal).slice(0, 4);
  const displayList = flashProducts.length > 0 ? flashProducts : (products || []).slice(0, 4);

  return (
    <section 
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 font-sans"
    >
      {/* Elevated, ultra-clean Flash Sale Container with subtle top gradient bar */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-zinc-200/90 p-3 sm:p-5 lg:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        
        {/* Top subtle brand gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-hover to-primary" />
        
        {/* Responsive Header Section */}
        <div className="mb-3.5 sm:mb-5 pb-3 border-b border-zinc-100">
          
          {/* Mobile Header Layout (2 Rows: Row 1 = Badge + View All, Row 2 = Timer) */}
          <div className="flex sm:hidden flex-col gap-2.5">
            {/* Top Row: Badge & View All */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
                <span>{displayTitle}</span>
              </span>

              <Link
                href="/best-deals"
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-primary text-zinc-900 hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs"
              >
                <span>{'View All Best Deals'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Bottom Row: Full-width Centered Timer Pill */}
            <div className="flex items-center justify-between bg-primary-light px-3 py-1.5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>{'ENDS IN:'}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-bold text-white">
                <span className="bg-zinc-900 px-2 py-0.5 rounded-md shadow-inner">
                  {formatDigit(timeLeft.hours)}
                </span>
                <span className="text-zinc-500 font-bold font-sans">:</span>
                <span className="bg-zinc-900 px-2 py-0.5 rounded-md shadow-inner">
                  {formatDigit(timeLeft.minutes)}
                </span>
                <span className="text-zinc-500 font-bold font-sans">:</span>
                <span className="bg-primary px-2 py-0.5 rounded-md shadow-xs animate-pulse">
                  {formatDigit(timeLeft.seconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Header Layout (Single Clean Row) */}
          <div className="hidden sm:flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
                <span>{displayTitle}</span>
              </span>

              <span className="text-xs font-semibold text-zinc-500">
                {displaySubtitle}
              </span>

              {/* Inline Countdown Timer */}
              <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1 rounded-xl border border-zinc-200/80 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  {'ENDS IN:'}
                </span>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-white">
                  <span className="bg-zinc-900 px-1.5 py-0.5 rounded-md shadow-inner">
                    {formatDigit(timeLeft.hours)}
                  </span>
                  <span className="text-zinc-400 font-bold font-sans">:</span>
                  <span className="bg-zinc-900 px-1.5 py-0.5 rounded-md shadow-inner">
                    {formatDigit(timeLeft.minutes)}
                  </span>
                  <span className="text-zinc-400 font-bold font-sans">:</span>
                  <span className="bg-primary px-1.5 py-0.5 rounded-md shadow-xs animate-pulse">
                    {formatDigit(timeLeft.seconds)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/best-deals"
              className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-primary text-zinc-900 hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs"
            >
              <span>{'View All Best Deals'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Flawless 2-column Grid on Mobile, 3-col on Tablet, 4-col on Desktop */}
        {isLoading || displayList.length === 0 ? (
          <div className="py-8 flex items-center justify-center col-span-full">
            <LoadingSpinner size="sm" text={'Loading flash deals...'} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {displayList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
});
