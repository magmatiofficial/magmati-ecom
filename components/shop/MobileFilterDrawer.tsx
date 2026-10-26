'use client';

import React from 'react';
import { FilterSidebar, ColorOption } from '@/components/product/FilterSidebar';
import { CategoryItem } from '@/types';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  allSizes: string[];
  allColors: ColorOption[];
  allBrands: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedSubcategory?: string;
  onSelectSubcategory?: (sub: string) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
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
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
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
}) => {
  return (
    <>
      <div
        className={`pure-drawer-backdrop lg:hidden ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside
        className={`pure-drawer-panel drawer-right lg:hidden flex flex-col ${
          isOpen ? 'is-open' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Product Filters"
      >
        <div className="h-full overflow-y-auto p-4 no-scrollbar">
          <FilterSidebar
            categories={categories}
            allSizes={allSizes}
            allColors={allColors}
            allBrands={allBrands}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              onSelectCategory(cat);
            }}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={(sub) => {
              if (onSelectSubcategory) {
                onSelectSubcategory(sub);
              }
              onClose();
            }}
            selectedSize={selectedSize}
            onSelectSize={onSelectSize}
            selectedColor={selectedColor}
            onSelectColor={onSelectColor}
            selectedBrand={selectedBrand}
            onSelectBrand={onSelectBrand}
            maxPrice={maxPrice}
            onChangeMaxPrice={onChangeMaxPrice}
            minRating={minRating}
            onSelectMinRating={onSelectMinRating}
            onlyDeals={onlyDeals}
            onToggleDeals={onToggleDeals}
            inStockOnly={inStockOnly}
            onToggleInStock={onToggleInStock}
            onClearFilters={onClearFilters}
            activeFilterCount={activeFilterCount}
            isMobileDrawer
            onCloseMobileDrawer={onClose}
          />
        </div>
      </aside>
    </>
  );
};
