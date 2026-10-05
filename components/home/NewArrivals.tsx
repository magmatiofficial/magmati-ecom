/**
 * @file components/home/NewArrivals.tsx
 * @description Fresh drops and trending arrivals across all categories with clean spacing.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export interface NewArrivalsProps {
  products: Product[];
  isLoading?: boolean;
  preset?: string;
  title?: string;
  subtitle?: string;
  bgColor?: string;
}

export const NewArrivals = React.memo(function NewArrivals({ 
  products,
  isLoading = false,
  preset = 'grid_4',
  title,
  subtitle,
  bgColor,
}: NewArrivalsProps) {
  const displayTitle = (title) || ('New Arrivals & Latest Collection');
  const displaySubtitle = (subtitle) || ('LATEST MARKETPLACE ARRIVALS');

  const newProducts = (products || []).filter((p) => p.isNew);
  const displayedProducts = newProducts.length >= 4 
    ? newProducts.slice(0, 8) 
    : (products || []).slice(0, 8);

  return (
    <section 
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 ${bgColor ? 'w-full' : ''}`}
    >
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4 sm:mb-6 pb-3 border-b border-zinc-200/90">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="p-1 rounded-md bg-primary-subtle text-primary border border-primary/20 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-eyebrow font-black text-primary uppercase tracking-wider block font-sans">
              {displaySubtitle}
            </span>
          </div>
          <h2 className="font-sans text-xl sm:text-2xl font-black tracking-tight text-zinc-900">
            {displayTitle}
          </h2>
        </div>

        <Link
          href="/shop?filter=new"
          className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-primary text-zinc-800 hover:text-app-inverse text-xs font-bold transition-all duration-200 shadow-2xs shrink-0 cursor-pointer"
        >
          <span>{'Browse All New'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Product Display Grid */}
      {isLoading || displayedProducts.length === 0 ? (
        <div className="py-8 flex items-center justify-center">
          <LoadingSpinner size="sm" text={'Loading new arrivals...'} />
        </div>
      ) : preset === 'horizontal_scroll' ? (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scrollbar-hide snap-x snap-mandatory py-2 -mx-3 px-3 sm:mx-0 sm:px-0 gpu-smooth">
          {displayedProducts.map((p) => (
            <div key={p.id} className="w-[170px] sm:w-[220px] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {displayedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
});
