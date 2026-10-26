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
import { PRODUCT_CARD_SLOT_CLASS, PRODUCT_GRID_CLASS } from '@/components/product/ProductCardSlot';

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

  const gridProducts = newProducts.length >= 4 
    ? newProducts.slice(0, 12) 
    : (products || []).slice(0, 12);

  return (
    <section 
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 pb-5 sm:py-8 ${bgColor ? 'w-full' : ''}`}
    >
      {/* Section Header */}
      <div className="flex flex-nowrap items-center justify-between gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-black tracking-tight text-text-main leading-tight line-clamp-2 sm:line-clamp-1">
              {displayTitle}
            </h2>
            <span className="hidden sm:block text-2xs font-bold text-text-muted uppercase tracking-wider truncate">
              {displaySubtitle}
            </span>
          </div>
        </div>

        <Link
          href="/shop?filter=new"
          className="inline-flex items-center gap-1.5 text-2xs sm:text-xs font-bold text-text-main bg-surface hover:bg-surface-hover border border-border px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0 whitespace-nowrap"
        >
          <span>{'Browse All'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
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
            <div key={p.id} className={PRODUCT_CARD_SLOT_CLASS}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : (
        <div className={PRODUCT_GRID_CLASS}>
          {gridProducts.map((p, i) => {
            let visibilityClass = "flex [&>*]:flex-1 [&>*]:min-w-0";
            if (i === 6 || i === 7) visibilityClass = "hidden lg:flex [&>*]:flex-1 [&>*]:min-w-0";
            else if (i === 8 || i === 9) visibilityClass = "hidden xl:flex [&>*]:flex-1 [&>*]:min-w-0";
            else if (i === 10 || i === 11) visibilityClass = "hidden 2xl:flex [&>*]:flex-1 [&>*]:min-w-0";
            
            return (
              <div key={p.id} className={visibilityClass}>
                <ProductCard product={p} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});
