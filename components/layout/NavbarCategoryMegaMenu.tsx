'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { CategoryItem, SubCategoryItem } from '@/types';

interface NavbarCategoryMegaMenuProps {
  
  categories: CategoryItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  navCategoryLabel: string;
}

export const NavbarCategoryMegaMenu: React.FC<NavbarCategoryMegaMenuProps> = ({
  
  categories,
  isOpen,
  onToggle,
  onClose,
  navCategoryLabel,
}) => {
  // Active selected or hovered parent category
  const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
    return categories[0]?.id || '';
  });

  // Ensure active category is set when categories load
  const activeCategory = (categories || []).find((c) => c.id === activeCategoryId) || categories[0];

  const getSubcategoryName = (sub: string | SubCategoryItem) => {
    if (typeof sub === 'string') return sub;
    return sub.name;
  };

  const getSubcategoryRawName = (sub: string | SubCategoryItem) => {
    if (typeof sub === 'string') return sub;
    return sub.name;
  };

  return (
    <div className="relative">
      {/* Mega Menu Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer shadow-2xs text-white ${
          isOpen 
            ? 'bg-primary text-white shadow-sm' 
            : 'bg-primary hover:bg-primary-hover text-white'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-white" />
        <span className="text-white font-bold">{navCategoryLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Two-Column Nested Categories Mega Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-[880px] max-w-[94vw] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex overflow-hidden ring-1 ring-black/5 divide-x divide-zinc-200">
            
            {/* Left Column: ALL CATEGORIES List - Absolute Indicator Bar, ZERO Layout Push */}
            <div className="w-72 bg-zinc-50/70 py-2.5 flex flex-col shrink-0">
              <div className="px-4 py-1.5 text-2xs font-extrabold uppercase tracking-widest text-zinc-400 border-b border-zinc-200/80 mb-1 flex items-center justify-between">
                <span>{'ALL CATEGORIES'}</span>
                <span className="text-primary font-mono text-2xs font-bold">{categories.length}</span>
              </div>

              <div className="max-h-[460px] overflow-y-auto custom-scrollbar-thin space-y-1 px-2">
                {(categories || []).map((cat) => {
                  const isSelected = (activeCategory?.id === cat.id);

                  return (
                    <div
                      key={cat.id || cat.name}
                      onMouseEnter={() => setActiveCategoryId(cat.id)}
                      className={`relative flex items-center justify-between pl-3 pr-2.5 py-2 rounded-xl cursor-pointer transition-colors duration-150 border font-semibold text-xs overflow-hidden ${
                        isSelected 
                          ? 'bg-white text-primary border-primary/30 shadow-xs' 
                          : 'text-zinc-700 bg-transparent border-transparent hover:bg-zinc-200/60 hover:text-zinc-950'
                      }`}
                    >
                      {/* Absolute indicator bar - position absolute so it takes 0px in layout box model and NEVER pushes content right */}
                      {isSelected && (
                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Main Category Image Thumbnail */}
                        <div className={`relative w-8 h-8 rounded-lg overflow-hidden border shrink-0 bg-white shadow-2xs transition-colors ${
                          isSelected ? 'border-primary/40' : 'border-zinc-200'
                        }`}>
                          <Image
                            src={cat.image || '/placeholder-category.svg'}
                            alt={cat.name}
                            fill
                            sizes="32px"
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs truncate block leading-tight font-semibold ${isSelected ? 'text-primary' : 'text-zinc-800'}`}>
                            {cat.name}
                          </span>
                          <span className="text-2xs text-zinc-400 font-normal block font-mono">
                            {cat.subcategories?.length || 0} {'subcategories'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isSelected ? 'text-primary' : 'text-zinc-400'
                      }`} />
                    </div>
                  );
                })}
              </div>

              {/* Bottom "View All Products" Link */}
              <div className="mt-auto pt-2 px-3 border-t border-zinc-200/80">
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="text-2xs font-bold text-primary hover:text-primary-hover hover:underline flex items-center justify-center gap-1 py-1"
                >
                  <span>{'View All Products →'}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Active Category Subcategories Grid */}
            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between bg-white min-w-0">
              <div>
                {/* Active Category Header */}
                <div className="pb-3 border-b border-zinc-100 flex items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-primary/30 shrink-0 bg-zinc-100 shadow-xs">
                      <Image
                        src={activeCategory?.image || '/placeholder-category.svg'}
                        alt={activeCategory?.name || 'Category'}
                        fill
                        sizes="44px"
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-zinc-950 tracking-tight leading-tight">
                        {activeCategory?.name}
                      </h3>
                      <p className="text-2xs text-zinc-500 font-medium">
                        {'Browse specific product subcategories'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/shop?category=${encodeURIComponent(activeCategory?.name || '')}`}
                    onClick={onClose}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0 bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <span>{'All Products'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  </Link>
                </div>

                {/* Subcategories Grid */}
                {activeCategory?.subcategories && activeCategory.subcategories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {activeCategory.subcategories.map((sub, idx) => {
                      const subName = getSubcategoryName(sub);
                      const rawName = getSubcategoryRawName(sub);
                      return (
                        <Link
                          key={idx}
                          href={`/shop?category=${encodeURIComponent(activeCategory.name)}&q=${encodeURIComponent(rawName)}`}
                          onClick={onClose}
                          className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50/80 hover:bg-primary/10 border border-zinc-200/80 hover:border-primary/40 text-xs sm:text-sm font-semibold text-zinc-800 hover:text-primary transition-colors cursor-pointer shadow-2xs"
                        >
                          <span className="truncate">{subName}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-primary transition-colors shrink-0 ml-1.5" />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-zinc-400 space-y-2">
                    <p className="text-xs font-medium">
                      {'No subcategories registered for this category.'}
                    </p>
                    <Link
                      href={`/shop?category=${encodeURIComponent(activeCategory?.name || '')}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      <span>{'Browse products directly'}</span>
                      <ArrowRight className="w-3 h-3 text-primary" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Bottom Quick Bar */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-2xs text-zinc-500 mt-6">
                <span>
                  {`${activeCategory?.subcategories?.length || 0} Subcategories Available`}
                </span>
                <Link
                  href="/category"
                  onClick={onClose}
                  className="font-bold text-zinc-800 hover:text-primary transition-colors"
                >
                  {'Category Gallery Index →'}
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
