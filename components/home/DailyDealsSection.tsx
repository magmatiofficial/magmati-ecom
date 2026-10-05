/**
 * @file components/home/DailyDealsSection.tsx
 * @description Daily Deals section with countdown timer, discount badges, stock availability progress bars,
 * fully clickable product cards leading to product details, and consistent Best Deals CTA button labels.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/product/ProductCard';

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

  // Countdown timer state (e.g. 13 hours 31 mins 57 secs)
  const [timeLeft, setTimeLeft] = useState({ hours: 13, minutes: 31, seconds: 57 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = (products || []).slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 font-sans">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-zinc-900 rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Title + Countdown Timer + Consistent Best Deals CTA */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {(title) || ('Daily Deals')}
              </h2>
              <p className="text-2xs text-zinc-300 font-medium mt-0.5">
                {'Limited time exclusive price drops'}
              </p>
            </div>
          </div>

          {/* Countdown timer blocks */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-300 mr-1 uppercase tracking-wider">
              {'ENDS IN'}
            </span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
              <span className="px-2 py-1 bg-white text-zinc-900 rounded-lg shadow-sm">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-primary font-black">:</span>
              <span className="px-2 py-1 bg-white text-zinc-900 rounded-lg shadow-sm">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-primary font-black">:</span>
              <span className="px-2 py-1 bg-white text-zinc-900 rounded-lg shadow-sm">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            <Link
              href="/best-deals"
              className="ml-2 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <span>{'View All Best Deals'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
          {isLoading || dealProducts.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 sm:p-4 shadow-md space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-zinc-200 rounded-lg animate-pulse" />
                </div>
                <div className="w-full h-40 sm:h-48 rounded-xl bg-zinc-200 animate-pulse" />
                <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
                <div className="h-5 w-1/3 bg-zinc-200 rounded animate-pulse" />
                <div className="h-9 w-full bg-zinc-200 rounded-xl animate-pulse mt-2" />
              </div>
            ))
          ) : (
            dealProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
