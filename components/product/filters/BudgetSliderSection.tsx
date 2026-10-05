'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import { formatBDT } from '@/lib/formatCurrency';

interface BudgetSliderSectionProps {
  
  maxPrice: number;
  onChangeMaxPrice: (price: number) => void;
}

export const BudgetSliderSection: React.FC<BudgetSliderSectionProps> = ({
    maxPrice,
  onChangeMaxPrice,
}) => {
  const pricePresets = [
    { label: '< ৳1,000', value: 1000 },
    { label: '< ৳2,000', value: 2000 },
    { label: '< ৳5,000', value: 5000 },
    { label: '< ৳10,000', value: 10000 },
  ];

  return (
    <div className="bg-surface-subtle border border-border-token rounded-2xl p-3.5 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-primary" />
          <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
            {'Max Budget'}
          </h4>
        </div>
        <span className="text-xs font-bold text-primary font-mono px-2 py-0.5 rounded bg-primary-subtle border border-primary-subtle">
          {formatBDT(maxPrice)}
        </span>
      </div>

      <input
        type="range"
        min="500"
        max="20000"
        step="500"
        value={maxPrice}
        onChange={(e) => onChangeMaxPrice(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer h-1.5 bg-border-token rounded-lg"
      />

      <div className="flex justify-between text-2xs text-app-muted font-mono">
        <span>৳500</span>
        <span>৳20,000</span>
      </div>

      {/* Quick Budget Presets */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {pricePresets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChangeMaxPrice(preset.value)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              maxPrice === preset.value
                ? 'bg-primary text-app-inverse shadow-xs'
                : 'bg-surface text-app-text hover:bg-surface-hover border border-border-token'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
