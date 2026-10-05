'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Heart, Globe, Truck } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUIStore } from '@/store/useUIStore';
import { useHydrated } from '@/hooks/useHydrated';

export function MobileHeader() {
  const mounted = useHydrated();

  const cartItems = useCartStore((state) => state.items);
  const totalCartItems = React.useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const openCart = useCartStore((state) => state.openCart);
  const totalWishlistItems = useWishlistStore((state) => state.items.length);
  const openWishlist = useWishlistStore((state) => state.openWishlist);
  const openSearch = useUIStore((state) => state.openSearch);

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs gpu-smooth">
      <div className="flex items-center justify-between px-3.5 py-2.5">
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <BrandLogo size="sm" showSubtitle={false} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Search Icon Button */}
          <button
            type="button"
            onClick={openSearch}
            className="p-2 text-zinc-700 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-zinc-100"
            aria-label="Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Track Order Icon Button */}
          {mounted && (
            <Link
              href="/track"
              className="p-2 text-zinc-700 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-zinc-100"
              title="Track Order"
              aria-label="Track Order"
            >
              <Truck className="w-4.5 h-4.5" />
            </Link>
          )}

          {/* Wishlist */}
          <button
            type="button"
            onClick={openWishlist}
            className="relative p-2 text-zinc-700 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-zinc-100"
            aria-label="Wishlist"
          >
            <Heart className="w-4.5 h-4.5" />
            {mounted && totalWishlistItems > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary text-white text-2xs font-bold flex items-center justify-center shadow-xs">
                {totalWishlistItems}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={openCart}
            className="relative p-2 text-text-main hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-zinc-100"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && totalCartItems > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-white text-2xs font-bold flex items-center justify-center shadow-xs">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
