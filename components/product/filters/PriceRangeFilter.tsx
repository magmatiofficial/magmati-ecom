'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import { formatBDT } from '@/lib/formatCurrency';

interface PriceRangeFilterProps {
  
  maxPrice: number;
  onChangeMaxPrice: (price: number) => void;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
    maxPrice,
  onChangeMaxPrice,
}) => {
  return (
    <div className="space-y-3 pb-5 border-b border-zinc-200">
      <div className="flex items-center justify-between">
        <h4 className="font-sans text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-zinc-500" />
          <span>{'Max Price'}</span>
        </h4>
        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
          {formatBDT(maxPrice)}
        </span>
      </div>

      <input
        type="range"
        min={300}
        max={25000}
        step={100}
        value={maxPrice}
        onChange={(e) => onChangeMaxPrice(Number(e.target.value))}
        aria-label={'Max price range'}
        className="w-full accent-primary cursor-pointer h-1.5 bg-zinc-200 rounded-lg appearance-none"
      />

      <div className="flex justify-between text-2xs font-mono text-zinc-600 font-medium">
        <span>{formatBDT(300)}</span>
        <span>{formatBDT(25000)}</span>
      </div>
    </div>
  );
};
