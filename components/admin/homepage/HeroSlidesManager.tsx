'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface HeroSlide {
  id: string;
  image: string;
  titleEn: string;
  subtitleEn: string;
  badgeEn: string;
  buttonLink: string;
}

interface HeroSlidesManagerProps {
  slides: HeroSlide[];
  onAddSlide: () => void;
  onEditSlide: (slide: HeroSlide) => void;
  onDeleteSlide: (id: string) => void;
}

export const HeroSlidesManager: React.FC<HeroSlidesManagerProps> = ({
  slides,
  onAddSlide,
  onEditSlide,
  onDeleteSlide,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Hero Carousel Banners</h2>
          <p className="text-sm text-gray-500">Manage promotional slides displayed on the storefront homepage hero slider.</p>
        </div>
        <button
          onClick={onAddSlide}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium text-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide) => (
          <div key={slide.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-gray-50">
            <div className="relative h-36 w-full bg-gray-200">
              {slide.image ? (
                <Image src={slide.image} alt={slide.titleEn || 'Slide'} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
              )}
              {slide.badgeEn && (
                <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  {slide.badgeEn}
                </span>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm truncate">{slide.titleEn || 'Untitled Slide'}</h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">{slide.subtitleEn || 'No subtitle'}</p>
                <p className="text-[11px] text-gray-400 mt-1">Link: {slide.buttonLink || '/shop'}</p>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => onEditSlide(slide)}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-100"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => onDeleteSlide(slide.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 rounded text-xs font-medium hover:bg-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
