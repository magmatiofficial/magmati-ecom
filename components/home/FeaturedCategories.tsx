/**
 * @file components/home/FeaturedCategories.tsx
 * @description Premium, high-converting horizontal category carousel.
 * Crafted with elevated card architecture:
 * - Rounded-2xl cards with soft shadows, subtle borders, and smooth hover lift
 * - Multi-tone brand gradient halos around crisp circular photography
 * - Bold typography with category item count pill badges
 * - Sleek left/right scroll controls and seamless touch swiping
 */

'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, LayoutGrid } from 'lucide-react';
import { CategoryItem } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export interface FeaturedCategoriesProps {
  categories: CategoryItem[];
  isLoading?: boolean;
  preset?: string;
  title?: string;
  subtitle?: string;
  bgColor?: string;
}

export function FeaturedCategories({ 
  categories, 
  isLoading = false,
  title,
  subtitle,
  bgColor,
}: FeaturedCategoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayTitle = (title) || ('Featured Categories');
  const displaySubtitle = (subtitle) || ('TOP COLLECTIONS');

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section 
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7"
    >
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4 sm:mb-5 pb-3 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="p-1 rounded-md bg-primary-subtle text-primary border border-primary/20">
              <LayoutGrid className="w-3.5 h-3.5" />
            </span>
            <span className="text-eyebrow font-black uppercase tracking-wider text-primary">
              {displaySubtitle}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            {displayTitle}
          </h2>
        </div>

        {/* Action Controls: View All Link + Nav Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/category"
            className="group hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-primary text-zinc-800 hover:text-app-inverse text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs mr-1"
          >
            <span>{'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-button bg-surface hover:bg-surface-hover text-app-text border border-border-color shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-button bg-surface hover:bg-surface-hover text-app-text border border-border-color shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Premium Horizontal Scrollable Carousel Track */}
      <div 
        ref={scrollRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-2 pt-1 px-1 -mx-1 snap-x snap-mandatory no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {isLoading || !categories || categories.length === 0 ? (
          <div className="w-full flex items-center justify-center py-6">
            <LoadingSpinner size="sm" text={'Loading categories...'} />
          </div>
        ) : (
          categories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center justify-between w-28 sm:w-32 md:w-36 shrink-0 snap-start bg-surface hover:bg-gradient-to-b hover:from-surface hover:to-primary-subtle/30 rounded-card border border-border-color hover:border-primary/70 p-3 sm:p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              {/* Layered Image Halo Frame */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-zinc-200 via-primary-subtle to-primary/70 group-hover:from-primary group-hover:to-primary-hover shadow-2xs group-hover:shadow-xs transition-all duration-200 mb-2.5 group-hover:scale-105">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-100 border-2 border-white">
                  <Image
                    src={cat.image || '/placeholder-category.svg'}
                    alt={cat.name}
                    fill
                    sizes="80px"
                    className="object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Subtle top indicator for the first 2 popular categories */}
                {idx < 2 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-primary text-app-inverse text-2xs font-black uppercase tracking-wider border border-white shadow-2xs">
                    HOT
                  </span>
                )}
              </div>

              {/* Typography & Item Count Pill */}
              <div className="w-full text-center flex flex-col items-center">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-primary transition-colors truncate w-full">
                  {cat.name}
                </h3>
                
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-zinc-100 group-hover:bg-primary-subtle text-2xs font-bold text-zinc-500 group-hover:text-primary transition-colors">
                  {cat.itemCount ?? 20}+ {'items'}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
