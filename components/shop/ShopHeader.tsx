'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw, LayoutGrid, List, X } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface ShopHeaderProps {
  selectedCategory: string;
  totalCount: number;
  loadedCount: number;
  activeFilterCount: number;
  clearFilters: () => void;
  onOpenMobileFilters: () => void;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  setSortBy: (val: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest') => void;
  viewLayout: 'grid' | 'list';
  setViewLayout: (layout: 'grid' | 'list') => void;

  // Search & Filters props for inline rendering
  searchQuery: string;
  setSearchInput: (v: string) => void;
  setSearchQuery: (v: string) => void;
  onlyDeals: boolean;
  setOnlyDeals: (v: boolean) => void;
  freeShippingOnly: boolean;
  setFreeShippingOnly: (v: boolean) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  formatBDT: (amount: number) => string;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  selectedCategory,
  totalCount,
  loadedCount,
  activeFilterCount,
  clearFilters,
  onOpenMobileFilters,
  sortBy,
  setSortBy,
  viewLayout,
  setViewLayout,

  searchQuery,
  setSearchInput,
  setSearchQuery,
  onlyDeals,
  setOnlyDeals,
  freeShippingOnly,
  setFreeShippingOnly,
  inStockOnly,
  setInStockOnly,
  selectedBrand,
  setSelectedBrand,
  minRating,
  setMinRating,
  maxPrice,
  setMaxPrice,
  formatBDT,
}) => {
  const isProgressive = loadedCount < totalCount;

  // Active filters excluding the selected category (since the title itself represents the category)
  const nonCategoryFiltersCount = 
    (searchQuery.trim() !== '' ? 1 : 0) +
    (onlyDeals ? 1 : 0) +
    (freeShippingOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (selectedBrand !== 'All' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (maxPrice < 25000 ? 1 : 0);

  return (
    <header className="bg-white border-b border-zinc-200/90 py-3.5 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2.5">
          
          {/* Main Controls Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            
            {/* Left Section: Category Title & Progress indicator */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-sans text-lg sm:text-xl md:text-2xl font-black text-zinc-900 tracking-tight">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h1>
              
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-2xs font-bold border border-primary/20 font-mono">
                {isProgressive ? (
                  <span>{`${loadedCount}/${totalCount}`}</span>
                ) : (
                  <span>{totalCount} Items</span>
                )}
                {isProgressive && (
                  <div className="w-8 h-1 bg-primary/20 rounded-full overflow-hidden shrink-0">
                    <div 
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, (loadedCount / totalCount) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Clear All active filters inside header */}
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-2xs sm:text-2xs font-black transition-colors cursor-pointer shadow-xs active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{'Clear All'}</span>
                </button>
              )}
            </div>

            {/* Right Section: Compact Filter triggers, Sort dropdown & layout switcher */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={onOpenMobileFilters}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs active:scale-95 transition-transform"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>{'Filters'}</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-2xs flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort selection */}
              <div className="flex items-center gap-1.5 shrink-0">
                <CustomDropdown
                  value={sortBy}
                  onChange={(val) => setSortBy(val as any)}
                  options={[
                    { value: 'featured', label: 'Featured' },
                    { value: 'price-low', label: 'Price: Low' },
                    { value: 'price-high', label: 'Price: High' },
                    { value: 'rating', label: 'Rating' },
                    { value: 'newest', label: 'Newest' },
                  ]}
                  triggerClassName="h-9 min-w-[120px] sm:min-w-[140px] px-3 bg-zinc-100 hover:bg-zinc-200/80 border-zinc-200 rounded-xl"
                  dropdownClassName="min-w-[140px]"
                />
              </div>

              {/* Layout Toggle Buttons */}
              <div className="flex items-center gap-0.5 bg-zinc-100 border border-zinc-200 rounded-xl p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewLayout('grid')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-2xs sm:text-xs font-bold transition-all cursor-pointer ${
                    viewLayout === 'grid'
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                  title={'Grid View'}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{'Grid'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('list')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-2xs sm:text-xs font-bold transition-all cursor-pointer ${
                    viewLayout === 'list'
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                  title={'List View'}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{'List'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
