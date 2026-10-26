'use client';

import React from 'react';
import { Palette, Check } from 'lucide-react';
import { ColorOption } from '../FilterSidebar';

interface ColorFilterSwatchesProps {
  
  allColors: ColorOption[];
  selectedColor: string;
  onSelectColor: (colorName: string) => void;
}

export const ColorFilterSwatches: React.FC<ColorFilterSwatchesProps> = ({
    allColors,
  selectedColor,
  onSelectColor,
}) => {
  return (
    <div className="bg-surface-subtle border border-border-token rounded-2xl p-3.5 space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
            {'Color Palette'}
          </h4>
        </div>
        {selectedColor !== 'All' && (
          <button
            type="button"
            onClick={() => onSelectColor('All')}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            {'Reset Color'}
          </button>
        )}
      </div>

      {/* Color Swatch Circles */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onSelectColor('All')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedColor === 'All'
              ? 'bg-surface-active text-app-inverse shadow-xs'
              : 'bg-surface text-app-text hover:bg-surface-hover border border-border-token'
          }`}
        >
          {'All Colors'}
        </button>

        {allColors.map((col) => {
          const isSelected = selectedColor === col.name;
          const isWhite = col.hex.toLowerCase() === '#ffffff' || col.hex.toLowerCase() === '#fff';
          return (
            <button
              key={col.name}
              type="button"
              onClick={() => onSelectColor(col.name)}
              title={col.name}
              className={`group relative w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                isSelected ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: col.hex }}
            >
              {isWhite && <span className="absolute inset-0 rounded-full border border-border-token" />}
              {isSelected && (
                <Check
                  className={`w-3.5 h-3.5 ${
                    isWhite ? 'text-app-text' : 'text-app-inverse drop-shadow-sm'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
