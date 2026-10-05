/**
 * @file components/cart/WishlistDrawer.tsx
 * @description Slide-in wishlist drawer allowing customers to review saved favorites
 * and move them directly to the shopping cart.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { formatBDT } from '@/lib/formatCurrency';
import { Button } from '@/components/ui/Button';

export function WishlistDrawer() {
  const { isWishlistOpen, closeWishlist, items, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const totalItemsCount = mounted ? items.length : 0;
  const itemsList = mounted ? items : [];

  const handleMoveToCart = (product: Product) => {
    addItem(product);
    toggleWishlist(product);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`pure-drawer-backdrop ${isWishlistOpen ? 'is-open' : ''}`}
        onClick={closeWishlist}
        aria-hidden={!isWishlistOpen}
      />

      {/* Drawer Panel */}
      <aside
        className={`pure-drawer-panel drawer-right flex flex-col ${
          isWishlistOpen ? 'is-open' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="My Wishlist"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-token/90 bg-surface">
          <div className="flex items-center gap-2 font-sans">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <h2 className="font-sans font-bold text-base sm:text-lg text-app-text">
              {'My Wishlist'}
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-950 text-white font-sans">
              {totalItemsCount}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closeWishlist}
            className="p-2 text-app-muted hover:text-primary rounded-full hover:bg-surface-subtle transition-colors h-10 w-10 min-h-0 min-w-0"
            aria-label="Close Wishlist"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-border-subtle no-scrollbar font-sans bg-surface">
          {itemsList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 font-sans">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-sans font-bold text-app-text text-base mb-1">
                {'Your Wishlist is Empty'}
              </h3>
              <p className="text-xs text-app-muted max-w-xs mb-6 leading-relaxed">
                {'Save your favorite items here to view or buy later.'}
              </p>
              <Button
                variant="primary"
                onClick={closeWishlist}
                className="rounded-full"
              >
                {'Continue Shopping'}
              </Button>
            </div>
          ) : (
            (itemsList || []).map((product) => (
              <div key={product.id} className="py-4 flex gap-4 items-start first:pt-0">
                <Link
                  href={`/product/${product.id}`}
                  onClick={closeWishlist}
                  className="relative w-20 h-24 rounded-xl overflow-hidden bg-surface-subtle border border-border-token shrink-0"
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="80px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/product/${product.id}`}
                      onClick={closeWishlist}
                      className="text-xs font-bold text-app-text hover:text-primary transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleWishlist(product)}
                      className="text-app-muted hover:text-primary transition-colors p-1 -mr-1 h-8 w-8 min-h-0 min-w-0"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <p className="text-eyebrow text-app-muted font-mono mt-0.5">
                    {product.category}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="font-mono text-xs sm:text-sm font-bold text-app-text">
                      {formatBDT(product.price)}
                    </span>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMoveToCart(product)}
                      className="px-3 py-1.5 rounded-lg text-white text-eyebrow font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-2xs h-auto min-h-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{'Move to Bag'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
