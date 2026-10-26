'use client';

import React from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';

interface PromoDealSlotProps {
  sizerProduct: Product;
  children: React.ReactNode;
}

/**
 * Slot for a promo card inside the Quick Deals row.
 * Width = two normal product-card widths + one gap (same percentages as the product row in QuickDealsSection, gap 0.75rem).
 * Height = an invisible real ProductCard (ghost) of half the slot width, so it always equals a normal card height.
 */
export function PromoDealSlot({ sizerProduct, children }: PromoDealSlotProps) {
  return (
    <div className="relative shrink-0 snap-start w-[calc(92%+0.75rem)] sm:w-[calc(62%+0.75rem)] md:w-[calc(46%+0.75rem)] lg:w-[calc(36%+0.75rem)] 2xl:w-[calc(30%+0.75rem)]">
      <div
        aria-hidden="true"
        inert
        className="invisible pointer-events-none select-none w-[calc((100%-0.75rem)/2)]"
      >
        <ProductCard product={sizerProduct} />
      </div>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
