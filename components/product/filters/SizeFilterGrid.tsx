'use client';

import React from 'react';
import { Tag } from 'lucide-react';

interface SizeFilterGridProps {
  
  allSizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

export const SizeFilterGrid: React.FC<SizeFilterGridProps> = ({
    allSizes,
  selectedSize,
  onSelectSize,
}) => {
  if (allSizes.length <= 1) return null;

  return (
    <div className="bg-surface-subtle border border-border-token rounded-2xl p-3.5 space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-primary" />
          <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
            {'Variants & Sizes'}
          </h4>
        </div>
        {selectedSize !== 'All' && (
          <button
            type="button"
            onClick={() => onSelectSize('All')}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            {'Reset Size'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allSizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onSelectSize(size)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSize === size
                ? 'bg-primary text-app-inverse shadow-xs scale-105'
                : 'bg-surface text-app-text hover:bg-surface-hover border border-border-token'
            }`}
          >
            {size === 'All' ? ('All Sizes') : size}
          </button>
        ))}
      </div>
    </div>
  );
};
