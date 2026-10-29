'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
    <div className="space-y-3 mb-3">
      {/* Color / Variant Selector */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-app-text">
              {'Color / Option'}:
            </span>
            <span className="text-xs text-app-muted font-medium">
              {selectedColor.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {product.colors.map((color) => (
              <Button
                key={color.hex}
                type="button"
                onClick={() => setSelectedColor(color)}
                variant="outline"
                size="icon"
                className={`w-7 h-7 rounded-full border-2 p-0.5 transition-all flex items-center justify-center cursor-pointer ${
                  selectedColor.hex === color.hex ? 'border-primary scale-110' : 'border-border-token'
                }`}
                title={color.name}
              >
                <span
                  className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: color.hex }}
                >
                  {selectedColor.hex === color.hex && (
                    <Check className={`w-3 h-3 ${color.hex === '#FFFFFF' || color.hex === '#F8F9FA' ? 'text-black' : 'text-white'}`} />
                  )}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Size / Variant Option Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-app-text">
              {'Size / Variant'}:
            </span>
            <span className="text-xs text-app-muted font-medium">
              Selected: <strong className="text-app-text">{selectedSize}</strong>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <Button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                variant={selectedSize === size ? 'primary' : 'outline'}
                size="sm"
                className={`min-w-8 h-7 px-2.5 sm:min-w-9 sm:h-8 rounded-button border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedSize === size
                    ? 'text-primary border-primary ring-1 ring-primary'
                    : 'text-app-text border-border-token hover:border-app-muted'
                }`}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
