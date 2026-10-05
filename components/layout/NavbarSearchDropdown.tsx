'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, TrendingUp, Search, Star } from 'lucide-react';
import { Product } from '@/types';
import { formatBDT } from '@/lib/formatCurrency';

interface NavbarSearchDropdownProps {
  searchQuery: string;
  
  searchResults: Product[];
  onSelectProduct: (product: Product) => void;
  onSearchCategory: (category: string) => void;
  onClose: () => void;
}

export const NavbarSearchDropdown: React.FC<NavbarSearchDropdownProps> = ({
  searchQuery,
  
  searchResults,
  onSelectProduct,
  onSearchCategory,
  onClose,
}) => {
  const trendingSearches = [
    'Smart Watches',
    'Panjabi Collection',
    'Premium T-Shirt',
    'Wireless Earbuds',
    'Casual Sneakers',
  ];

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200/90 p-3.5 z-50 max-h-[480px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
      {searchQuery.trim().length === 0 ? (
        <div>
          <div className="flex items-center justify-between text-eyebrow font-bold text-primary uppercase tracking-wider mb-2.5">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{'Trending Searches'}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {trendingSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => onSearchCategory(term)}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="text-eyebrow font-bold text-zinc-400 uppercase tracking-wider mb-2">
            {'Popular Departments'}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onSearchCategory('Men Fashion')}
              className="text-left px-3 py-2 rounded-xl bg-zinc-50 hover:bg-primary-light/40 transition-colors font-semibold text-zinc-800 cursor-pointer"
            >
              👔 {"Men's Collection"}
            </button>
            <button
              type="button"
              onClick={() => onSearchCategory('Gadgets')}
              className="text-left px-3 py-2 rounded-xl bg-zinc-50 hover:bg-primary-light/40 transition-colors font-semibold text-zinc-800 cursor-pointer"
            >
              ⚡ {'Tech Gadgets'}
            </button>
          </div>
        </div>
      ) : searchResults.length > 0 ? (
        <div>
          <div className="flex items-center justify-between text-eyebrow font-bold text-zinc-400 uppercase tracking-wider mb-2">
            <span>{'Products Found'}</span>
            <span className="font-mono text-zinc-500">{searchResults.length} {'items'}</span>
          </div>
          <div className="divide-y divide-zinc-100">
            {searchResults.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 shrink-0 bg-zinc-100">
                  <Image
                    src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                    alt={product.name}
                    fill
                    sizes="48px"
                    referrerPolicy="no-referrer"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-primary transition-colors">
                    {product.name}
                  </p>
                  <p className="text-eyebrow text-zinc-400 truncate">
                    {product.category}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-primary font-mono">
                    {formatBDT(product.price)}
                  </p>
                  {product.rating && (
                    <p className="text-2xs text-amber-500 flex items-center justify-end gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-500" />
                      <span>{product.rating}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2.5 border-t border-zinc-100 mt-2 text-center">
            <Link
              href={`/shop?q=${encodeURIComponent(searchQuery.trim())}`}
              onClick={onClose}
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{'View All Results'}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-zinc-500">
          <Search className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <p className="font-semibold text-zinc-800 mb-0.5">
            {'No matches found'}
          </p>
          <p className="text-eyebrow text-zinc-400">
            {'Try searching for generic keywords like "t-shirt", "watch", or "shoes"'}
          </p>
        </div>
      )}
    </div>
  );
};
