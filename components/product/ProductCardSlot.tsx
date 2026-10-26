'use client';

import React from 'react';
import { ProductCard, ProductCardProps } from '@/components/product/ProductCard';

// cards per view are 2 on mobile, 3 from sm, 4 from lg, 5 from xl, 6 from 2xl (never more than 6); the widths assume the scroll container uses "gap-3 sm:gap-4"; PRODUCT_GRID_CLASS is the matching grid for non-carousel lists.
export const PRODUCT_CARD_SLOT_CLASS = 'shrink-0 snap-start w-[calc((100%_-_0.75rem)/2)] sm:w-[calc((100%_-_2rem)/3)] lg:w-[calc((100%_-_3rem)/4)] xl:w-[calc((100%_-_4rem)/5)] 2xl:w-[calc((100%_-_5rem)/6)]';
export const PRODUCT_GRID_CLASS = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4';

/**
 * A wrapper component that enforces a standard fixed width for product cards.
 * This ensures consistency across different carousel sections (Flash Deals, Quick Deals, etc.)
 */
export function ProductCardSlot({ className, ...cardProps }: ProductCardProps & { className?: string }) {
  return (
    <div className={className ? `${PRODUCT_CARD_SLOT_CLASS} ${className}` : PRODUCT_CARD_SLOT_CLASS}>
      <ProductCard {...cardProps} />
    </div>
  );
}
