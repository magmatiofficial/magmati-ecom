/**
 * @file components/product/FilterSidebar.tsx
 * @description Master E-Commerce Faceted Filter Sidebar with modularized filter architecture.
 */

'use client';

import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { CategoryItem } from '@/types';
import { CategoryFilterList } from '@/components/product/filters/CategoryFilterList';
import { BudgetSliderSection } from '@/components/product/filters/BudgetSliderSection';
import { ColorFilterSwatches } from '@/components/product/filters/ColorFilterSwatches';
import { BrandFilterList } from '@/components/product/filters/BrandFilterList';
import { SizeFilterGrid } from '@/components/product/filters/SizeFilterGrid';
import { RatingFilterList } from '@/components/product/filters/RatingFilterList';
import { StockDealsToggles } from '@/components/product/filters/StockDealsToggles';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface FilterSidebarProps {
  categories: CategoryItem[];
  allSizes: string[];
  allColors: ColorOption[];
  allBrands: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSubcategory?: string;
  onSelectSubcategory?: (subcategory: string) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  selectedColor: string;
  onSelectColor: (colorName: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  maxPrice: number;
  onChangeMaxPrice: (price: number) => void;
  minRating: number;
  onSelectMinRating: (rating: number) => void;
  onlyDeals: boolean;
  onToggleDeals: () => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const FilterSidebar = React.memo(function FilterSidebar({
  categories,
  allSizes,
  allColors,
  allBrands,
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  selectedSize,
  onSelectSize,
  selectedColor,
  onSelectColor,
  selectedBrand,
  onSelectBrand,
  maxPrice,
  onChangeMaxPrice,
  minRating,
  onSelectMinRating,
  onlyDeals,
  onToggleDeals,
  inStockOnly,
  onToggleInStock,
  onClearFilters,
  activeFilterCount,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: FilterSidebarProps) {

  return (
    <aside className="w-full space-y-4 font-sans">
      {/* 1. Header Bar: Title, Count badge, Reset & Close */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-sm font-bold text-app-text uppercase tracking-wider">
              {'Filters'}
            </h3>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-app-inverse text-2xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-primary-subtle text-app-muted hover:text-primary text-xs font-bold flex items-center gap-1 transition-colors border border-border-subtle cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{'Reset'}</span>
            </button>
          )}

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-1.5 text-app-muted hover:text-app-text rounded-lg hover:bg-surface-subtle cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Department & Categories */}
      <CategoryFilterList
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        selectedSubcategory={selectedSubcategory}
        onSelectSubcategory={onSelectSubcategory}
      />

      {/* 3. Price Budget Slider */}
      <BudgetSliderSection
        
        maxPrice={maxPrice}
        onChangeMaxPrice={onChangeMaxPrice}
      />

      {/* 4. Color Swatches */}
      <ColorFilterSwatches
        
        allColors={allColors}
        selectedColor={selectedColor}
        onSelectColor={onSelectColor}
      />

      {/* 5. Brands Filter */}
      <BrandFilterList
        
        allBrands={allBrands}
        selectedBrand={selectedBrand}
        onSelectBrand={onSelectBrand}
      />

      {/* 6. Variants & Sizes */}
      <SizeFilterGrid
        
        allSizes={allSizes}
        selectedSize={selectedSize}
        onSelectSize={onSelectSize}
      />

      {/* 7. Rating Filter */}
      <RatingFilterList
        
        minRating={minRating}
        onSelectMinRating={onSelectMinRating}
      />

      {/* 8. Special Deals & Stock Availability Toggles */}
      <StockDealsToggles
        
        onlyDeals={onlyDeals}
        onToggleDeals={onToggleDeals}
        inStockOnly={inStockOnly}
        onToggleInStock={onToggleInStock}
      />
    </aside>
  );
});
