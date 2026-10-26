'use client';

import React from 'react';
import { Award } from 'lucide-react';

interface BrandFilterListProps {
  
  allBrands: string[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export const BrandFilterList: React.FC<BrandFilterListProps> = ({
    allBrands,
  selectedBrand,
  onSelectBrand,
}) => {
  if (allBrands.length === 0) return null;

  return (
    <div className="bg-surface-subtle border border-border-token rounded-2xl p-3.5 space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-primary" />
          <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
            {'Brands'}
          </h4>
        </div>
        {selectedBrand !== 'All' && (
          <button
            type="button"
            onClick={() => onSelectBrand('All')}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            {'Reset Brand'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectBrand('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedBrand === 'All'
              ? 'bg-surface-active text-app-inverse shadow-xs'
              : 'bg-surface text-app-text hover:bg-surface-hover border border-border-token'
          }`}
        >
          {'All Brands'}
        </button>

        {allBrands.map((brand) => (
          <button
            key={brand}
            type="button"
            onClick={() => onSelectBrand(brand)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedBrand === brand
                ? 'bg-primary text-app-inverse shadow-xs scale-105'
                : 'bg-surface text-app-text hover:bg-surface-hover border border-border-token'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
};
