'use client';

import React from 'react';
import { Sparkles, Flame, PackageCheck } from 'lucide-react';

interface StockDealsTogglesProps {
  
  onlyDeals: boolean;
  onToggleDeals: () => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
}

export const StockDealsToggles: React.FC<StockDealsTogglesProps> = ({
    onlyDeals,
  onToggleDeals,
  inStockOnly,
  onToggleInStock,
}) => {
  return (
    <div className="bg-surface-subtle border border-border-token rounded-2xl p-3.5 space-y-2.5 font-sans">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
          {'Deals & Stock'}
        </h4>
      </div>

      <label className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border-token cursor-pointer hover:border-primary transition-colors">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-app-text">
            {'On-Sale Deals Only'}
          </span>
        </div>
        <input
          type="checkbox"
          checked={onlyDeals}
          onChange={onToggleDeals}
          className="w-4 h-4 accent-primary rounded cursor-pointer"
        />
      </label>

      <label className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border-token cursor-pointer hover:border-success transition-colors">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-success" />
          <span className="text-xs font-semibold text-app-text">
            {'In Stock Only'}
          </span>
        </div>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={onToggleInStock}
          className="w-4 h-4 accent-primary rounded cursor-pointer"
        />
      </label>
    </div>
  );
};
