/**
 * @file components/home/BudgetDealsSection.tsx
 * @description High-conversion Budget Deals & Quick Price Tier Selector with single-row segmented control.
 */

'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Tag, ArrowRight, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ProductCardSlot } from '@/components/product/ProductCardSlot';

type BudgetTier = 500 | 1000 | 1500 | 2000;

export function BudgetDealsSection() {
  const { products } = useProducts();
  const [selectedBudget, setSelectedBudget] = useState<BudgetTier>(1000);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

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
      return matchingBudgetProducts.slice(0, 12);
    }
    // Fallback: show lowest priced items from catalog
    return [...products].sort((a, b) => a.price - b.price).slice(0, 12);
  }, [products, matchingBudgetProducts]);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 font-sans">
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-border shadow-sm p-3.5 sm:p-5 lg:p-6">

        {/* Header: Title + View All CTA */}
        <div className="flex items-center justify-between flex-nowrap gap-3 mb-4 sm:mb-5 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-text-main truncate">
                {'Budget Deals'}
              </h2>
            </div>
          </div>

          {/* View All Button */}
          <Link
            href={`/shop?maxPrice=${selectedBudget}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-main bg-surface hover:bg-surface-hover border border-border px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer whitespace-nowrap"
          >
            <span>{'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Budget Control Banner */}
        <div className="bg-surface-subtle border border-border rounded-2xl p-2.5 sm:p-3.5 mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-subtle text-primary text-2xs font-medium shrink-0">
              <Gift className="w-3 h-3 text-primary" />
              <span>{'SELECT YOUR BUDGET'}</span>
            </div>
          </div>

          {/* Budget Pills Selector */}
          <div role="group" aria-label="Select your budget" className="flex gap-1 p-1 bg-surface border border-border rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
            {budgetTiers.map(({ tier, labelEn }) => {
              const isSelected = selectedBudget === tier;
              const count = products ? products.filter((p) => p.price <= tier).length : 0;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedBudget(tier)}
                  aria-pressed={isSelected}
                  aria-label={labelEn}
                  className={`flex-1 shrink-0 min-w-[52px] sm:min-w-fit whitespace-nowrap flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-1 sm:px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isSelected ? 'bg-primary text-white font-semibold' : 'text-text-main hover:bg-surface-hover'
                  }`}
                >
                  <span className="sm:hidden flex flex-col items-center leading-tight">
                    <span className="text-2xs font-normal">{'Under'}</span>
                    <span className="text-sm font-semibold">{`৳${tier}`}</span>
                  </span>
                  <span className="hidden sm:inline">{labelEn}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-2xs font-medium ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-surface-subtle text-text-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fallback Notice Badge if selected budget tier currently has 0 items */}
        {isFallback && (
          <div className="mb-3.5 px-3.5 py-2.5 rounded-2xl bg-surface-subtle border border-border-color text-text-main text-xs font-medium flex items-center justify-between gap-2">
            <span>
              {`No items available under ৳${selectedBudget} right now. Showing our lowest priced verified products below:`}
            </span>
          </div>
        )}

        {/* Product Carousel */}
        <div className="relative md:px-12">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white text-primary border border-zinc-200 ring-4 ring-primary/10 shadow-card hover:bg-primary hover:text-white hover:border-primary hover:ring-primary/20 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.75]" />
          </button>

          <div
            ref={scrollRef}
            className="flex flex-row overflow-x-auto gap-3 sm:gap-4 pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <ProductCardSlot key={p.id} product={p} />
              ))
            ) : (
              <div className="w-full flex flex-col items-center justify-center p-8 bg-surface-subtle rounded-2xl border border-border-color text-center min-h-[220px]">
                <Tag className="w-8 h-8 text-text-subtle mb-2" />
                <p className="text-sm font-medium text-text-main">
                  {'No products found within this budget tier'}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {'Please select a different budget option above'}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white text-primary border border-zinc-200 ring-4 ring-primary/10 shadow-card hover:bg-primary hover:text-white hover:border-primary hover:ring-primary/20 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.75]" />
          </button>
        </div>

      </div>
    </section>
  );
}

