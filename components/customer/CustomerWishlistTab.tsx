'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Table as TableIcon, LayoutGrid, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { ProductCard } from '@/components/product/ProductCard';

interface CustomerWishlistTabProps {
  wishlistItems: Product[];
  
  formatBDT: (amount: number, lang?: any) => string;
  wishlistViewMode: 'table' | 'grid';
  setWishlistViewMode: (mode: 'table' | 'grid') => void;
  addToCart: (product: Product) => void;
  removeWishlistItem: (productId: string) => void;
}

export const CustomerWishlistTab: React.FC<CustomerWishlistTabProps> = ({
  wishlistItems,
    formatBDT,
  wishlistViewMode,
  setWishlistViewMode,
  addToCart,
  removeWishlistItem,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 flex-wrap gap-2">
        <div>
          <h2 className="font-sans text-xs sm:text-sm font-bold text-text-main">
            {'Saved Wishlist Items'}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xs text-zinc-500 font-sans hidden sm:inline">{wishlistItems.length} items</span>
          {wishlistItems.length > 0 && (
            <div className="flex items-center gap-0.5 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                type="button"
                onClick={() => setWishlistViewMode('table')}
                className={`px-2 py-0.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  wishlistViewMode === 'table'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title="Table View"
              >
                <TableIcon className="w-3 h-3" />
                <span className="text-xs">{'Table'}</span>
              </button>
              <button
                type="button"
                onClick={() => setWishlistViewMode('grid')}
                className={`px-2 py-0.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  wishlistViewMode === 'grid'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="text-xs">{'Grid'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-8 text-center shadow-2xs font-sans">
          <Heart className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
          <h3 className="font-sans text-sm font-bold text-zinc-900 mb-0.5">
            {'No Items Saved Yet'}
          </h3>
          <p className="text-xs text-zinc-500 mb-4 font-sans">
            {'Explore our collections and tap the heart icon on items you love.'}
          </p>
          <Link
            href="/shop"
            className="px-5 py-2 rounded-full bg-primary text-white text-xs font-medium uppercase tracking-wider hover:bg-primary-hover transition-colors font-sans inline-block"
          >
            {'Explore Collections'}
          </Link>
        </div>
      ) : wishlistViewMode === 'table' ? (
        /* Wishlist Table View */
        <ResponsiveTableContainer showScrollCues={true}>
          <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[700px]">
            <thead className="bg-zinc-100 text-zinc-600 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <tr>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 w-14">Visual</th>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">
                  {'Product Details'}
                </th>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">
                  {'Category'}
                </th>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-right">
                  {'Price (BDT)'}
                </th>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-center">
                  {'Availability'}
                </th>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-center">
                  {'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {wishlistItems.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50/40 transition-colors group">
                  <td className="px-3 py-1.5 border-b border-r border-zinc-200">
                    <div className="relative w-8 h-10 rounded-md overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                      <Image
                        src={p.images[0] || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop'}
                        alt={p.name || 'Wishlist product thumbnail'}
                        fill
                        sizes="32px"
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-1.5 border-b border-r border-zinc-200 max-w-sm">
                    <Link
                      href={`/product/${p.id}`}
                      className="font-bold text-zinc-800 line-clamp-1 group-hover:text-primary transition-colors text-xs"
                    >
                      {p.name}
                    </Link>
                    <div className="text-2xs text-zinc-500 line-clamp-1 italic">{p.name}</div>
                  </td>
                  <td className="px-3 py-1.5 border-b border-r border-zinc-200 text-zinc-600 font-medium whitespace-nowrap">
                    <span className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded text-2xs font-semibold border border-zinc-200">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 border-b border-r border-zinc-200 font-bold text-right text-zinc-900 whitespace-nowrap text-xs">
                    {formatBDT(p.price)}
                  </td>
                  <td className="px-3 py-1.5 border-b border-r border-zinc-200 text-center">
                    {(p.stockQuantity ?? 10) === 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        In Stock ({p.stockQuantity ?? 10})
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 border-b border-r border-zinc-200 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        className="px-2 py-0.5 bg-secondary hover:bg-primary text-white rounded text-2xs font-bold transition-colors inline-flex items-center gap-0.5 shadow-2xs cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-2.5 h-2.5" />
                        <span>{'Add to Bag'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeWishlistItem(p.id)}
                        className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded text-2xs font-bold hover:bg-red-100 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>{'Remove'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTableContainer>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {wishlistItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
