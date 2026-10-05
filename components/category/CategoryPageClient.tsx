'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight, Layers } from 'lucide-react';
import { useCategoryStore } from '@/store/useCategoryStore';
import { products } from '@/data/products';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const subcategoriesMap: Record<string, string[]> = {
  'men-ethnic': ['Panjabi', 'Kabli Set', 'Pajama', 'Koti'],
  'women-ethnic': ['Kurti', 'Three Piece', 'Salwar Kameez'],
  'men-casual': ['Polo Shirts', 'Casual Shirts', 'T-Shirts'],
  'women-saree': ['Jamdani', 'Silk', 'Muslin', 'Cotton'],
  'kids-wear': ['Boys Panjabi', 'Girls Frock', 'Kids Casual'],
  'men-denim': ['Denim Jeans', 'Chinos', 'Cargo Pants'],
  'leather-footwear': ['Nagras', 'Sandals', 'Formal Shoes'],
  'accessories-oud': ['Attar & Oud', 'Caps', 'Belts'],
};

export const CategoryPageClient = React.memo(function CategoryPageClient() {
  const { categories } = useCategoryStore();
  const [activeGenderTab, setActiveGenderTab] = useState<'all' | 'men' | 'women' | 'kids'>('all');
  const isLoading = !categories || categories.length === 0;

  const filteredCategories = React.useMemo(() => {
    return (categories || []).filter((cat) => {
      if (activeGenderTab === 'all') return true;
      if (activeGenderTab === 'men') return cat.name.toLowerCase().includes("men") && !cat.name.toLowerCase().includes("women");
      if (activeGenderTab === 'women') return cat.name.toLowerCase().includes("women");
      if (activeGenderTab === 'kids') return cat.name.toLowerCase().includes("kids");
      return true;
    });
  }, [activeGenderTab, categories]);

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Compact Editorial Header */}
      <section className="bg-secondary text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-2xs font-bold tracking-widest uppercase text-zinc-300 mb-1.5">
              <Layers className="w-3 h-3 text-primary" />
              <span>{'Departments & Collections'}</span>
            </span>
            <h1 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              {'Curated Categories'}
            </h1>
          </div>

          {/* Compact Segment Filter Pill Bar */}
          <div className="inline-flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-full shrink-0">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'men', label: 'Men' },
                { id: 'women', label: 'Women' },
                { id: 'kids', label: 'Kids' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveGenderTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeGenderTab === tab.id
                    ? 'bg-primary text-app-inverse shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Compact Categories Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <LoadingSpinner
              size="lg"
              text={'Loading categories...'}
              subtext={'Please wait a moment'}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredCategories.map((cat) => {
              const productCount = products.filter((p) => p.category === cat.name).length;
              return (
                <div
                  key={cat.id}
                  className="group relative bg-white border border-border-color rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-zinc-950 transition-all duration-300 shadow-3xs"
                >
                  <div className="space-y-3">
                    {/* Header: Title and Item Count */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-sans font-bold text-sm text-text-main group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                        <span className="text-2xs text-text-muted font-bold tracking-wider uppercase">
                          {productCount} {productCount === 1 ? 'Product' : 'Products'}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-surface-subtle text-text-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Category Poster Thumbnail */}
                    {cat.image && (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-surface-subtle border border-zinc-100/80">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 250px"
                          referrerPolicy="no-referrer"
                          className="object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Subcategories Curated Hub */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-2xs font-black text-text-subtle uppercase tracking-wider block">
                        {'Popular Collections'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {((cat.id && subcategoriesMap[cat.id]) || ['All Curated Items']).map((sub, i) => (
                          <Link
                            key={i}
                            href={`/shop?category=${encodeURIComponent(cat.name)}`}
                            className="px-2 py-0.5 rounded-md bg-surface-subtle hover:bg-zinc-200 text-text-muted hover:text-text-main text-xs font-medium transition-colors"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Shop Action */}
                  <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-end">
                    <Link
                      href={`/shop?category=${encodeURIComponent(cat.name)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:text-primary-hover tracking-wider uppercase"
                    >
                      <span>{'Shop Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
});
