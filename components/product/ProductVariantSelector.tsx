'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Product, ProductColor } from '@/types';

interface ProductVariantSelectorProps {
  
  product: Product;
  selectedColor: ProductColor;
  setSelectedColor: (c: ProductColor) => void;
  selectedSize: string;
  setSelectedSize: (s: string) => void;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
    product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
}) => {
  return (
    <div className="space-y-6 mb-6">
      {/* Color / Variant Selector */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-app-text">
              {'Color / Option'}:
            </span>
            <span className="text-xs text-app-muted font-medium">
              {selectedColor.name}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {product.colors.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-9 h-9 rounded-full border-2 p-0.5 transition-all flex items-center justify-center cursor-pointer ${
                  selectedColor.hex === color.hex ? 'border-primary scale-110' : 'border-border-token'
                }`}
                title={color.name}
              >
                <span
                  className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: color.hex }}
                >
                  {selectedColor.hex === color.hex && (
                    <Check className={`w-3.5 h-3.5 ${color.hex === '#FFFFFF' || color.hex === '#F8F9FA' ? 'text-black' : 'text-white'}`} />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size / Variant Option Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-app-text">
              {'Size / Variant'}:
            </span>
            <span className="text-xs text-app-muted font-medium">
              Selected: <strong className="text-app-text">{selectedSize}</strong>
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`min-w-12 h-11 px-3.5 rounded-button border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedSize === size
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface text-app-text border-border-token hover:border-app-muted'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
