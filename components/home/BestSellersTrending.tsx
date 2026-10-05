/**
 * @file components/home/BestSellersTrending.tsx
 * @description High-conversion Tabbed Showcase for Best Sellers, Trending Items, and Top-Rated Gems.
 * Lets users switch between high-demand categories to find what shoppers in Bangladesh are loving most.
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Crown, 
  Flame, 
  Star, 
  ArrowRight, 
  Sparkles,
  Award
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { ProductCard } from '@/components/product/ProductCard';

type TabType = 'bestsellers' | 'trending' | 'toprated';

export interface BestSellersTrendingProps {
  preset?: string;
  titleEn?: string;
  subtitleEn?: string;
  bgColor?: string;
}

export function BestSellersTrending({
  preset = 'tabbed_grid',
  titleEn,
  subtitleEn,
  bgColor,
}: BestSellersTrendingProps = {}) {
  const { products } = useProductStore();
  const [activeTab, setActiveTab] = useState<TabType>('bestsellers');

  const displayTitle = (titleEn) || ('Best Sellers & Trending');
  const displaySubtitle = (subtitleEn) || ('SHOPPER FAVORITES');

  // Filter products based on selected tab
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const limit = preset === 'dense_matrix' ? 8 : 4;

    if (activeTab === 'bestsellers') {
      return [...products]
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, limit);
    }

    if (activeTab === 'trending') {
      return [...products]
        .filter((p) => p.isTrending || p.isFlashDeal || p.isNew)
        .slice(0, limit);
    }

    // Top rated 4.8+
    return [...products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }, [products, activeTab, preset]);

  return (
    <section 
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white rounded-3xl my-6 border border-zinc-100 shadow-xs ${bgColor ? '!bg-opacity-95' : ''}`}
    >
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-1.5">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>{displaySubtitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight">
            {displayTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {'Most loved and highest-rated items curated from real customer verified purchases.'}
          </p>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/80 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('bestsellers')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bestsellers'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 ${activeTab === 'bestsellers' ? 'text-amber-500 fill-amber-500' : ''}`} />
            <span>{'Most Popular'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trending'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${activeTab === 'trending' ? 'text-primary fill-primary' : ''}`} />
            <span>{'Trending'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('toprated')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'toprated'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${activeTab === 'toprated' ? 'text-brand-gold fill-brand-gold' : ''}`} />
            <span>{'Top Rated'}</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Footer Explore More Link */}
      <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <span>
            {'All items backed with 7-day easy exchange & official brand warranty'}
          </span>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors group"
        >
          <span>{'Explore Full Collection'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
