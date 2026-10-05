/**
 * @file components/home/BudgetDealsSection.tsx
 * @description High-conversion Budget Deals & Quick Price Tier Selector.
 * Allows customers to quickly filter products within specific price budgets
 * (e.g., Under ৳500, Under ৳1000, Under ৳1500, Under ৳2000) in a clean, 
 * fixed-height 1-row grid without height distortions or infinite scrolling.
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Tag, ArrowRight, Gift, Percent, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { ProductCard } from '@/components/product/ProductCard';

type BudgetTier = 500 | 1000 | 1500 | 2000;

export function BudgetDealsSection() {
  const { products } = useProductStore();
  const [selectedBudget, setSelectedBudget] = useState<BudgetTier>(1000);

  const budgetTiers: { tier: BudgetTier; labelEn: string }[] = [
    { tier: 500, labelEn: 'Under ৳500' },
    { tier: 1000, labelEn: 'Under ৳1000' },
    { tier: 1500, labelEn: 'Under ৳1500' },
    { tier: 2000, labelEn: 'Under ৳2000' },
  ];

  // Products matching selected budget tier
  const matchingBudgetProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => p.price <= selectedBudget);
  }, [products, selectedBudget]);

  const totalMatchingCount = matchingBudgetProducts.length;

  // Top products to display (if selected budget has 0 items, fallback to lowest price items so section is NEVER empty)
  const isFallback = totalMatchingCount === 0;
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (matchingBudgetProducts.length > 0) {
      return matchingBudgetProducts.slice(0, 4);
    }
    // Fallback: show lowest priced items from catalog
    return [...products].sort((a, b) => a.price - b.price).slice(0, 4);
  }, [products, matchingBudgetProducts]);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Section Title Header */}
      <div className="mb-4 sm:mb-6 pb-3 border-b border-zinc-200/90">
        {/* Top Row: Tag on left, View All on right */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-subtle text-primary border border-primary/20 shadow-2xs">
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span className="text-2xs sm:text-eyebrow font-black uppercase tracking-wider">
              {'SMART BUDGET FILTER'}
            </span>
          </div>

          {/* View All Button */}
          <Link
            href={`/shop?maxPrice=${selectedBudget}`}
            className="group inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-primary text-zinc-800 hover:text-app-inverse text-eyebrow sm:text-xs font-bold transition-all duration-200 shadow-2xs shrink-0 cursor-pointer"
          >
            <span>
              {`View All (${totalMatchingCount})`}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Heading */}
        <div className="mt-1">
          <h2 className="text-lg sm:text-2xl font-black text-zinc-900 tracking-tight">
            {'Budget Deals'}
          </h2>
        </div>
      </div>

      {/* Budget Control Banner */}
      <div className="relative bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl p-4 sm:p-5 text-white mb-6 shadow-xl border border-zinc-800 overflow-hidden">
        {/* Subtle Ambient Red Blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-2xs font-black uppercase tracking-wider mb-1.5">
              <Gift className="w-3 h-3 text-brand-gold" />
              <span>{'SELECT YOUR BUDGET'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              {'Find Best Verified Products In Your Budget'}
            </h3>
          </div>

          {/* Budget Pills Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {budgetTiers.map(({ tier, labelEn }) => {
              const isSelected = selectedBudget === tier;
              const count = products ? products.filter((p) => p.price <= tier).length : 0;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedBudget(tier)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-primary border-primary text-white font-black shadow-md scale-[1.03]'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                  }`}
                >
                  <span>{labelEn}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-2xs font-black ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-white/20 text-brand-gold'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fallback Notice Badge if selected budget tier currently has 0 items */}
      {isFallback && (
        <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between gap-2">
          <span>
            {`No items available under ৳${selectedBudget} right now. Showing our lowest priced verified products below:`}
          </span>
        </div>
      )}

      {/* Fixed 4-Column Product Grid (1 Row on Desktop, 2x2 on Mobile/Tablet) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))
        ) : (
          <div className="col-span-2 lg:col-span-4 flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-2xl border border-zinc-200 text-center min-h-[220px]">
            <Tag className="w-8 h-8 text-zinc-400 mb-2" />
            <p className="text-sm font-bold text-zinc-700">
              {'No products found within this budget tier'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {'Please select a different budget option above'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

