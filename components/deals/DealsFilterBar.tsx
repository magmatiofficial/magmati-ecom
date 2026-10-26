'use client';

import React from 'react';
import { Sparkles, Flame, Percent, Tag, ShoppingBag, Zap, SlidersHorizontal } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface DealsFilterBarProps {
  
  selectedFilter: 'all' | 'flash' | '50plus' | 'under500' | 'under1000' | 'clothing' | 'gadgets';
  setSelectedFilter: (filter: 'all' | 'flash' | '50plus' | 'under500' | 'under1000' | 'clothing' | 'gadgets') => void;
  sortBy: 'discount' | 'price-asc' | 'price-desc' | 'rating';
  setSortBy: (sort: 'discount' | 'price-asc' | 'price-desc' | 'rating') => void;
  totalProducts: number;
}

export const DealsFilterBar: React.FC<DealsFilterBarProps> = ({
    selectedFilter,
  setSelectedFilter,
  sortBy,
  setSortBy,
  totalProducts,
}) => {
  const tabs = [
    { id: 'all', labelEn: 'All Deals',  icon: Sparkles },
    { id: 'flash', labelEn: 'Flash Exclusives',  icon: Flame },
    { id: '50plus', labelEn: '40%+ OFF',  icon: Percent },
    { id: 'under500', labelEn: 'Under ৳500',  icon: Tag },
    { id: 'under1000', labelEn: 'Under ৳1000',  icon: Tag },
    { id: 'clothing', labelEn: 'Fashion',  icon: ShoppingBag },
    { id: 'gadgets', labelEn: 'Gadgets',  icon: Zap },
  ];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 p-3 sm:p-4 mb-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-app-inverse shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Sorter */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
          <span className="text-xs text-zinc-500 font-medium">
            {totalProducts} {'products'}
          </span>

          <div className="flex items-center gap-2 min-w-[160px]">
            <CustomDropdown
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={[
                { value: 'discount', label: 'Highest Discount' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
                { value: 'rating', label: 'Top Rated' },
              ]}
              triggerClassName="h-9 px-2.5 bg-zinc-100 border-zinc-200"
              searchable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
