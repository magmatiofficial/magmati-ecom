'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ProductColor } from '@/types';

export interface ProductAttributesTabProps {
  prodSizes: string;
  setProdSizes: (v: string) => void;
  prodColors: ProductColor[];
  setProdColors: React.Dispatch<React.SetStateAction<ProductColor[]>>;
  isActive: boolean;
}

export const ProductAttributesTab: React.FC<ProductAttributesTabProps> = ({
  prodSizes,
  setProdSizes,
  prodColors,
  setProdColors,
  isActive,
}) => {
  if (!isActive) return null;

  const addColorRow = () => {
    setProdColors((prev) => [...prev, { name: '', hex: '#000000' }]);
  };

  const updateColorRow = (idx: number, patch: Partial<ProductColor>) => {
    setProdColors((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const removeColorRow = (idx: number) => {
    setProdColors((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Sizes / Variants */}
      <div>
        <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
          Sizes / Options (Comma Separated)
        </label>
        <input
          type="text"
          value={prodSizes}
          onChange={(e) => setProdSizes(e.target.value)}
          placeholder="e.g. S, M, L, XL, XXL or 38, 40, 42, 44 or FREE SIZE"
          className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary text-xs"
        />
        <p className="text-2xs text-zinc-500 mt-1">
          These options will appear as selectable buttons on the customer shop and product details pages.
        </p>
      </div>

      {/* Color Swatches */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-zinc-900 block text-xs">Color Swatches</span>
            <span className="text-2xs text-zinc-500">Define available color variants with name and HEX code.</span>
          </div>
          <button
            type="button"
            onClick={addColorRow}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Color
          </button>
        </div>

        <div className="space-y-2">
          {prodColors.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-zinc-200 rounded-2xl p-4">
              <p className="text-zinc-500 text-xs mb-2">No color swatches defined yet.</p>
              <button
                type="button"
                onClick={addColorRow}
                className="px-3 py-1.5 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Add First Color
              </button>
            </div>
          ) : (
            prodColors.map((col, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <input
                  type="color"
                  value={col.hex || '#000000'}
                  onChange={(e) => updateColorRow(idx, { hex: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-zinc-300 cursor-pointer p-0 shrink-0"
                />
                <input
                  type="text"
                  value={col.name || ''}
                  onChange={(e) => updateColorRow(idx, { name: e.target.value })}
                  placeholder="Color Name e.g. Royal Indigo"
                  className="flex-1 h-8 px-2.5 border border-zinc-200 rounded-lg text-xs bg-white"
                />
                <input
                  type="text"
                  value={col.hex || ''}
                  onChange={(e) => updateColorRow(idx, { hex: e.target.value })}
                  placeholder="#HEX"
                  className="w-24 h-8 px-2 border border-zinc-200 rounded-lg text-xs bg-white font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={() => removeColorRow(idx)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  title="Remove Color"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
