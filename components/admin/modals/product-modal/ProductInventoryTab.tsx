import React from 'react';
import { NumberField } from '@/components/ui/NumberField';

export interface ProductInventoryTabProps {
  prodInStock: boolean;
  setProdInStock: (v: boolean) => void;
  prodStockQuantity: number;
  setProdStockQuantity: (v: number) => void;
  prodLowStockThreshold?: number;
  setProdLowStockThreshold: (v: number | undefined) => void;
  siteSettings?: { lowStockThreshold?: number };
  isActive: boolean;
}

export const ProductInventoryTab: React.FC<ProductInventoryTabProps> = ({
  prodInStock,
  setProdInStock,
  prodStockQuantity,
  setProdStockQuantity,
  prodLowStockThreshold,
  setProdLowStockThreshold,
  siteSettings = { lowStockThreshold: 5 },
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
        <div>
          <span className="font-bold text-zinc-900 block text-xs">Stock Status</span>
          <span className="text-[11px] text-zinc-500">Enable or disable purchasing for this product</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={prodInStock}
            onChange={(e) => setProdInStock(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Stock Quantity *</label>
          <NumberField
            required
            value={prodStockQuantity}
            onValueChange={(v) => setProdStockQuantity(v ?? 0)}
            placeholder="e.g. 50"
            className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden"
          />
        </div>
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
            Low Stock Threshold (Default: {siteSettings.lowStockThreshold || 5})
          </label>
          <NumberField
            value={prodLowStockThreshold}
            onValueChange={setProdLowStockThreshold || (() => {})}
            placeholder="Leave empty to use global store setting"
            className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden"
          />
        </div>
      </div>
    </div>
  );
};
