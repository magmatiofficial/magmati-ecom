'use client';

import React from 'react';
import Image from 'next/image';
import { Layers, Check, LayoutGrid } from 'lucide-react';
import { CategoryItem } from '@/types';

interface CategoryFilterListProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSubcategory?: string;
  onSelectSubcategory?: (subcategory: string) => void;
}

export const CategoryFilterList: React.FC<CategoryFilterListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSubcategory = 'All',
  onSelectSubcategory,
}) => {
  return (
    <div className="bg-surface-subtle border border-border-token rounded-2xl p-3.5 space-y-3 font-sans">
      <div className="flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5 text-primary" />
        <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
          {'Departments'}
        </h4>
      </div>

      <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar-thin">
        {/* All Departments Option */}
        <button
          type="button"
          onClick={() => onSelectCategory('All')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all text-left cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-surface-active text-app-inverse font-bold shadow-xs'
              : 'text-app-text hover:bg-surface-hover'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
              selectedCategory === 'All' ? 'bg-zinc-800 border-zinc-700 text-amber-400' : 'bg-white border-zinc-200 text-zinc-600'
            }`}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">{'All Departments'}</span>
          </div>
          {selectedCategory === 'All' && <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />}
        </button>

        {/* Dynamic Categories with Subcategories support */}
        {(categories || []).map((cat) => {
          const isSelected = (selectedCategory === cat.name);
          const hasSubs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;

          return (
            <div key={cat.id || cat.name} className="space-y-1">
              <button
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-surface-active text-app-inverse font-bold shadow-xs'
                    : 'text-app-text hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Category Thumbnail Image */}
                  <div className={`relative w-7 h-7 rounded-lg overflow-hidden border shrink-0 bg-white shadow-2xs ${
                    isSelected ? 'border-primary/50 ring-1 ring-primary/40' : 'border-zinc-200'
                  }`}>
                    <Image
                      src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&auto=format&fit=crop&q=80'}
                      alt={cat.name}
                      fill
                      sizes="28px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </div>
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-gold" />}
                  <span
                    className={`text-2xs font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-surface-dark-hover text-brand-gold'
                        : 'bg-border-token text-app-muted'
                    }`}
                  >
                    {cat.itemCount || 0}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
