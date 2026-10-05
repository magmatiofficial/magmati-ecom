/**
 * @file components/layout/CategoryDrawer.tsx
 * @description Dedicated Slide-In Category Navigation Drawer.
 * Clean, focused Category Menu with Category Title, Category Search, and Nested Accordion categories.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  X, 
  ChevronRight, 
  ChevronDown,
  LayoutGrid, 
  Search,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { SubCategoryItem } from '@/types';

export function CategoryDrawer() {
  const { isCategoryDrawerOpen, closeCategoryDrawer } = useUIStore();
  const { categories } = useCategoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  // Start with all category accordions CLOSED by default
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Reset expanded category and search term whenever drawer is closed
  React.useEffect(() => {
    if (!isCategoryDrawerOpen) {
      setExpandedCategoryId(null);
      setSearchTerm('');
    }
  }, [isCategoryDrawerOpen]);

  

  const toggleExpand = (catId: string) => {
    setExpandedCategoryId((prev) => (prev === catId ? null : catId));
  };

  const getSubcategoryName = (sub: string | SubCategoryItem) => {
    if (typeof sub === 'string') return sub;
    return sub.name;
  };

  const getSubcategoryRawName = (sub: string | SubCategoryItem) => {
    if (typeof sub === 'string') return sub;
    return sub.name;
  };

  const filteredCategories = React.useMemo(() => {
    if (!searchTerm.trim()) return categories || [];
    const term = searchTerm.toLowerCase().trim();
    return (categories || []).filter((cat) => {
      const matchParent = cat.name.toLowerCase().includes(term);
      const matchSub = cat.subcategories?.some((s) => {
        const name = typeof s === 'string' ? s : s.name;
        return name.toLowerCase().includes(term);
      });
      return matchParent || matchSub;
    });
  }, [categories, searchTerm]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`pure-drawer-backdrop ${isCategoryDrawerOpen ? 'is-open' : ''}`}
        onClick={closeCategoryDrawer}
        aria-hidden={!isCategoryDrawerOpen}
      />

      {/* Slide-In Categories Drawer */}
      <aside
        className={`pure-drawer-panel drawer-left flex flex-col bg-white ${
          isCategoryDrawerOpen ? 'is-open' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={'Categories'}
      >
        {/* Header: Category Title + Close Button */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 bg-zinc-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <LayoutGrid className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-sm tracking-tight text-white block leading-tight">
                {'Categories'}
              </h2>
              <span className="text-2xs text-zinc-400 font-mono">
                {categories.length} {'Available'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCategoryDrawer}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search */}
        <div className="p-3 bg-zinc-50 border-b border-zinc-200/80">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={'Search categories or subcategories...'}
              className="w-full h-8.5 pl-8 pr-7 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-primary"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Categories Accordion List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-thin divide-y divide-zinc-100">
          
          {/* "All Categories" Top Anchor */}
          <Link
            href="/category"
            onClick={closeCategoryDrawer}
            className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 hover:text-primary transition-colors font-bold text-xs text-zinc-800"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
              <LayoutGrid className="w-3.5 h-3.5" />
            </div>
            <span>{'All Categories Index'}</span>
          </Link>

          {/* Nested Categories List with Images & Zero-Shift Layout */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-10 px-4 text-zinc-400 text-xs font-medium">
              {'No matching categories found'}
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isExpanded = expandedCategoryId === cat.id;
              const hasSubs = cat.subcategories && cat.subcategories.length > 0;

              return (
                <div key={cat.id || cat.name} className="bg-white">
                  {/* Parent Category Row - Position relative with absolute indicator bar to prevent layout push */}
                  <div
                    onClick={() => {
                      if (hasSubs) {
                        toggleExpand(cat.id);
                      } else {
                        closeCategoryDrawer();
                        window.location.href = `/shop?category=${encodeURIComponent(cat.name)}`;
                      }
                    }}
                    className={`relative flex items-center justify-between pl-4 pr-4 py-2.5 cursor-pointer transition-colors font-semibold overflow-hidden ${
                      isExpanded 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-zinc-900 hover:bg-zinc-100/80 hover:text-primary'
                    }`}
                  >
                    {isExpanded && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}

                    <div className="flex items-center gap-3 min-w-0">
                      {/* Category Thumbnail Image */}
                      <div className={`relative w-8 h-8 rounded-lg overflow-hidden border shrink-0 bg-zinc-100 shadow-2xs ${
                        isExpanded ? 'border-primary/40' : 'border-zinc-200'
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
                      <span className={`text-xs truncate font-semibold ${isExpanded ? 'text-primary' : 'text-zinc-900'}`}>
                        {cat.name}
                      </span>
                    </div>

                    {hasSubs && (
                      <div className="p-1 text-zinc-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Nested Subcategories Accordion Content */}
                  {isExpanded && hasSubs && (
                    <div className="bg-zinc-50/80 px-4 py-2 space-y-1.5 border-l-2 border-primary/40 ml-4 my-1 rounded-r-xl">
                      {cat.subcategories!.map((sub, idx) => {
                        const subName = getSubcategoryName(sub);
                        const rawName = getSubcategoryRawName(sub);
                        return (
                          <Link
                            key={idx}
                            href={`/shop?category=${encodeURIComponent(cat.name)}&q=${encodeURIComponent(rawName)}`}
                            onClick={closeCategoryDrawer}
                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-primary/10 border border-zinc-200/80 hover:border-primary/30 text-xs font-semibold text-zinc-700 hover:text-primary transition-colors shadow-2xs"
                          >
                            <span className="truncate">{subName}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          </Link>
                        );
                      })}

                      {/* Quick Link to Browse Entire Parent Category */}
                      <div className="pt-2 border-t border-zinc-200/80 mt-2">
                        <Link
                          href={`/shop?category=${encodeURIComponent(cat.name)}`}
                          onClick={closeCategoryDrawer}
                          className="inline-flex items-center gap-1 text-2xs font-bold text-primary hover:underline uppercase tracking-wider"
                        >
                          <span>{'Browse All In Category →'}</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Direct Shopping Link */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50">
          <Link
            href="/shop"
            onClick={closeCategoryDrawer}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="text-white">{'Browse All Products'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </aside>
    </>
  );
}
