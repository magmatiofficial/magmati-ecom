/**
 * @file components/layout/SearchModal.tsx
 * @description Clean, minimalist floating live-search dropdown with instant matching products,
 * live price & rating preview, and simple trending searches without cluttering category tabs.
 */

'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  X, 
  TrendingUp, 
  Star, 
  ArrowRight,
  Truck,
  Flame
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { formatBDT } from '@/lib/formatCurrency';
import { products } from '@/data/products';

export function SearchModal() {
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery } = useUIStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  const trendingTags = useMemo(() => [
    { en: 'Smartwatch' },
    { en: 'Panjabi' },
    { en: 'Air Fryer' },
    { en: 'Wireless Earbuds' },
    { en: 'Polo Shirt' },
    { en: 'Jamdani Saree' },
    { en: 'Leather Loafers' },
    { en: 'Oud Attar' },
  ], []);

  // Filter products live directly matching name, category, brand, subcategory
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();

    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.subcategory.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }).slice(0, 7);
  }, [searchQuery]);

  if (!isSearchOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      closeSearch();
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    }
  };

  const handleClearInput = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleProductClick = () => {
    closeSearch();
  };

  const handleTagClick = (tagText: string) => {
    setSearchQuery(tagText);
    inputRef.current?.focus();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-start p-2.5 sm:p-4 md:p-8 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        // If clicking backdrop outside floating container, close search
        if (e.target === e.currentTarget) {
          closeSearch();
        }
      }}
    >
      {/* Floating Search Container Card */}
      <div 
        ref={containerRef}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[80dvh] animate-in zoom-in-95 duration-150"
      >
        {/* Top Search Input Bar */}
        <div className="p-3 sm:p-3.5 border-b border-zinc-100 bg-white sticky top-0 z-20">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-primary absolute left-3.5 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={'Search for products or brands...'}
                className="w-full h-11 sm:h-12 pl-11 pr-10 bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white rounded-xl text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden border border-zinc-200 focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/70 transition-colors cursor-pointer"
                  aria-label="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="h-11 sm:h-12 px-4 rounded-xl bg-primary hover:bg-primary-hover text-app-inverse text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer active:scale-95"
            >
              <span>{'Search'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeSearch}
              className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
              aria-label="Close search"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Floating Live Results Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin">
          {searchQuery.trim() === '' ? (
            /* Empty State: Simple Trending Keyword Tags */
            <div className="py-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>{'Trending Searches'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <button
                    key={tag.en}
                    type="button"
                    onClick={() => handleTagClick(tag.en)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-900 hover:text-white text-xs font-semibold text-zinc-800 transition-all border border-zinc-200/80 cursor-pointer active:scale-95 group"
                  >
                    <Flame className="w-3 h-3 text-brand-gold group-hover:text-amber-400" />
                    <span>{tag.en}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Live Filtered Products List */
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <span>{'Live Results'} ({filteredProducts.length})</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-2.5">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-700 mb-1">
                    {`No products found for "${searchQuery}"`}
                  </p>
                  <p className="text-xs text-zinc-400 mb-4">
                    {'Try checking your spelling or search for another item'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeSearch();
                      router.push('/shop');
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-primary transition-colors cursor-pointer"
                  >
                    {'Browse All Products'}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {filteredProducts.map((p) => {
                    const isFreeShip = p.price >= 999;
                    return (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        onClick={handleProductClick}
                        className="flex items-center gap-3.5 py-2.5 px-2 hover:bg-zinc-50 rounded-xl transition-all group cursor-pointer"
                      >
                        {/* Product Thumbnail */}
                        <div className="relative w-13 h-14 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shrink-0 shadow-2xs">
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            sizes="56px"
                            referrerPolicy="no-referrer"
                            className="object-cover group-hover:scale-108 transition-transform duration-300"
                          />
                          {p.discountPercent && p.discountPercent > 0 ? (
                            <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-primary text-app-inverse text-2xs font-black uppercase">
                              -{p.discountPercent}%
                            </span>
                          ) : null}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-primary transition-colors truncate">
                            {p.name}
                          </p>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-2xs font-bold text-primary uppercase tracking-wider truncate">
                              {p.category}
                            </span>
                            <span className="text-zinc-300 text-xs">•</span>
                            <div className="flex items-center gap-0.5 text-2xs font-semibold text-zinc-600">
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>{p.rating}</span>
                              <span className="text-zinc-400 text-2xs font-normal">({p.reviewCount || 12})</span>
                            </div>
                            {isFreeShip && (
                              <span className="hidden sm:inline-flex items-center gap-0.5 text-2xs font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-1 py-0.2 rounded">
                                <Truck className="w-2.5 h-2.5 text-amber-600" />
                                {'Free Ship'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price Column */}
                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-bold text-zinc-900 font-mono">
                            {formatBDT(p.price)}
                          </div>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <div className="text-2xs text-zinc-400 line-through font-mono">
                              {formatBDT(p.originalPrice)}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        {searchQuery.trim() !== '' && filteredProducts.length > 0 && (
          <div className="p-3 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium truncate">
              {`More results for "${searchQuery}"`}
            </span>
            <button
              type="button"
              onClick={() => {
                const q = searchQuery;
                closeSearch();
                router.push(`/shop?q=${encodeURIComponent(q)}`);
              }}
              className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-app-inverse rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              <span>{'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
