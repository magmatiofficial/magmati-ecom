'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, User } from 'lucide-react';
import { formatBDT } from '@/lib/formatCurrency';

interface NavbarActionIconsProps {
  mounted?: boolean;
  totalCartItems: number;
  totalCartPrice: number;
  openCart: () => void;
  totalWishlistItems: number;
  openWishlist: () => void;
}

export const NavbarActionIcons: React.FC<NavbarActionIconsProps> = ({
  mounted = true,
  totalCartItems,
  totalCartPrice,
  openCart,
  totalWishlistItems,
  openWishlist,
}) => {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Cart Total Badge Button */}
      <button
        type="button"
        onClick={openCart}
        className="group flex items-center gap-2.5 px-2.5 py-1 rounded-button bg-white hover:bg-primary-light/50 border border-zinc-200/90 hover:border-primary/40 shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-98 cursor-pointer"
        aria-label="Shopping Cart"
      >
        <div className="relative flex items-center justify-center w-7.5 h-7.5 rounded-button bg-primary text-white shadow-2xs group-hover:bg-primary-hover transition-all">
          <ShoppingBag className="w-4 h-4" />
          {mounted && (
            <span
              className={`absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full text-2xs font-black flex items-center justify-center border-2 border-white shadow-xs ${
                totalCartItems > 0 ? 'bg-secondary text-white' : 'bg-zinc-800 text-white'
              }`}
            >
              {totalCartItems}
            </span>
          )}
        </div>

        <div className="hidden lg:flex flex-col text-left leading-tight pr-0.5">
          <span className="text-2xs font-extrabold text-zinc-400 uppercase tracking-wider group-hover:text-primary transition-colors">
            {'CART TOTAL'}
          </span>
          <span className="text-xs font-black font-mono text-text-main group-hover:text-primary transition-colors">
            {mounted ? formatBDT(totalCartPrice) : formatBDT(0)}
          </span>
        </div>
      </button>

      {/* Wishlist */}
      <button
        type="button"
        onClick={openWishlist}
        className="relative p-2 text-zinc-700 hover:text-primary transition-all group rounded-xl hover:bg-primary-light/60 border border-transparent hover:border-primary/20 cursor-pointer"
        aria-label="Wishlist"
        title={'Wishlist'}
      >
        <Heart className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
        {mounted && totalWishlistItems > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-white text-2xs font-black flex items-center justify-center border-2 border-white shadow-xs">
            {totalWishlistItems}
          </span>
        )}
      </button>

      {/* Account */}
      <Link
        href="/account"
        className="p-2 text-zinc-700 hover:text-primary hover:bg-primary-light/60 rounded-xl transition-all border border-transparent hover:border-primary/20 cursor-pointer"
        aria-label="Account"
        title={'Account'}
      >
        <User className="w-4.5 h-4.5" />
      </Link>
    </div>
  );
};
