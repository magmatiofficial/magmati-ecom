/**
 * @file components/product/ProductGrid.tsx
 * @description High-performance responsive wrapper for product catalogs in Grid or List layout
 * with intelligent on-scroll progressive batch fetching, IntersectionObserver, and fallback load triggers.
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ShoppingBag, Loader2, CheckCircle2, ArrowUp, ChevronDown } from 'lucide-react';
import { SectionLoader } from '@/components/ui/LoadingSpinner';

export interface ProductGridProps {
  products: Product[];
  layout?: 'grid' | 'list';
  columns?: number;
  isLoading?: boolean;
  // Infinite scroll & progressive fetch props
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  totalCount?: number;
  loadedCount?: number;
  enableInfiniteScroll?: boolean;
  batchSize?: number;
}

export const ProductGrid = React.memo(function ProductGrid({ 
  products, 
  layout = 'grid', 
  isLoading = false,
  hasMore,
  onLoadMore,
  isLoadingMore = false,
  totalCount,
  loadedCount,
  enableInfiniteScroll = true,
  batchSize = 12,
}: ProductGridProps) {

  // Internal progressive slicing support if parent doesn't provide onLoadMore
  const [internalLimit, setInternalLimit] = useState<number>(batchSize);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  const isControlled = typeof onLoadMore === 'function';
  const effectiveProducts = isControlled
    ? products
    : enableInfiniteScroll
    ? products.slice(0, internalLimit)
    : products;

  const effectiveHasMore = isControlled
    ? Boolean(hasMore)
    : enableInfiniteScroll
    ? internalLimit < products.length
    : false;

  const effectiveIsLoadingMore = isControlled ? isLoadingMore : internalLoading;

  const displayTotal = totalCount !== undefined ? totalCount : products.length;
  const currentLoaded = loadedCount !== undefined ? loadedCount : effectiveProducts.length;

  // Reset internal limit when products array changes substantially
  useEffect(() => {
    if (!isControlled) {
      setInternalLimit(batchSize);
    }
  }, [products.length, isControlled, batchSize]);

  // Track window scroll position for floating back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerLoadMore = useCallback(() => {
    if (effectiveIsLoadingMore || !effectiveHasMore) return;

    if (isControlled && onLoadMore) {
      onLoadMore();
    } else {
      setInternalLoading(true);
      setTimeout(() => {
        setInternalLimit((prev) => Math.min(prev + batchSize, products.length));
        setInternalLoading(false);
      }, 150);
    }
  }, [effectiveIsLoadingMore, effectiveHasMore, isControlled, onLoadMore, batchSize, products.length]);

  // IntersectionObserver for seamless on-scroll auto-fetching
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enableInfiniteScroll || !effectiveHasMore || effectiveIsLoadingMore) return;

    const sentinelEl = sentinelRef.current;
    if (!sentinelEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          triggerLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '280px', // Fetch 280px before hitting bottom so it feels instantaneous
        threshold: 0.05,
      }
    );

    observer.observe(sentinelEl);
    return () => {
      observer.disconnect();
    };
  }, [enableInfiniteScroll, effectiveHasMore, effectiveIsLoadingMore, triggerLoadMore]);

  if (isLoading) {
    return (
      <SectionLoader
        text={'Loading products...'}
        subtext={'Please wait a moment'}
      />
    );
  }

  if (effectiveProducts.length === 0) {
    return (
      <div className="w-full bg-white rounded-3xl border border-zinc-200/90 p-12 text-center my-6 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="font-sans text-lg font-bold text-text-main mb-1">
          {'No Products Found'}
        </h3>
        <p className="font-sans text-xs text-zinc-500 max-w-sm mx-auto">
          {'We could not find any garments matching your active filter criteria. Try adjusting your filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product List or Grid */}
      {layout === 'list' ? (
        <div className="flex flex-col gap-3.5">
          {effectiveProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} layout="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5 items-stretch">
          {effectiveProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} layout="grid" />
          ))}
        </div>
      )}

      {/* Sentinel Element for Intersection Observer trigger */}
      {enableInfiniteScroll && effectiveHasMore && (
        <div ref={sentinelRef} className="h-6 w-full pointer-events-none" aria-hidden="true" />
      )}

      {/* Loading state during on-scroll fetch */}
      {effectiveIsLoadingMore && (
        <div className="py-6 flex flex-col items-center justify-center gap-2 animate-fade-in">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-zinc-200/90 shadow-xs text-xs font-semibold text-zinc-700">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>
              {'Fetching more products on scroll...'}
            </span>
          </div>
        </div>
      )}

      {/* Manual Click Fallback if user prefers or fast scroll */}
      {enableInfiniteScroll && effectiveHasMore && !effectiveIsLoadingMore && (
        <div className="pt-2 pb-4 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={triggerLoadMore}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-800 shadow-2xs hover:border-primary transition-all active:scale-95 cursor-pointer"
          >
            <ChevronDown className="w-4 h-4 text-primary" />
            <span>
              {`Load More Products (${currentLoaded}/${displayTotal})`}
            </span>
          </button>
        </div>
      )}

      {/* Reached End Indicator */}
      {!effectiveHasMore && effectiveProducts.length > 0 && (
        <div className="py-6 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 border border-zinc-200/80 text-2xs font-bold text-zinc-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {`All ${displayTotal} products successfully loaded`}
            </span>
          </div>
        </div>
      )}

      {/* Floating Scroll to Top button when user scrolls deep */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 sm:bottom-8 right-5 z-40 p-3 rounded-full bg-zinc-900/90 hover:bg-primary text-white shadow-xl backdrop-blur-xs transition-all active:scale-90 flex items-center justify-center border border-zinc-700/60 cursor-pointer group"
          title={'Back to top'}
          aria-label={'Back to top'}
        >
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
});
