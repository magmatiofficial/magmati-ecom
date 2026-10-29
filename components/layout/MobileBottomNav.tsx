/**
 * @file components/layout/MobileBottomNav.tsx
 * @description Sleek, spacious, and ergonomic Mobile Bottom Navigation Bar.
 * Features:
 * - 6 balanced columns with zero overlapping: Home, Categories, Flash Deals, Shop, Cart, Account.
 * - Single-line concise typography with truncate to prevent wrapping defects.
 * - Dynamic cart badge counter & pulsing fiery indicator for Flash Deals.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShoppingBag, 
  LayoutGrid, 
  Flame,
  User,
  RotateCcw
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export function MobileBottomNav() {
  const pathname = usePathname();
  const openCategoryDrawer = useUIStore((state) => state.openCategoryDrawer);

  const isHomeActive = pathname === '/';
  const isCategoryActive = pathname === '/category';
  const isDealsActive = pathname === '/best-deals';
  const isShopActive = pathname === '/shop';
  const isReturnActive = pathname === '/returns';
  const isAccountActive = pathname === '/account' || pathname?.startsWith('/account');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] gpu-accelerated">
      <nav className="grid grid-cols-6 items-center h-14 px-0.5 sm:px-2">
        
        {/* 1. Home */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer rounded-lg active:scale-95 px-0.5 min-w-0"
        >
          <div className="relative flex items-center justify-center">
            <Home className={`w-[18px] h-[18px] transition-transform ${
              isHomeActive ? 'text-primary stroke-[2.5] scale-105' : 'text-text-muted stroke-[1.75] hover:text-text-main'
            }`} />
          </div>
          <span className={`text-2xs mt-1 leading-none truncate max-w-full ${
            isHomeActive ? 'text-primary font-semibold' : 'text-text-muted font-medium hover:text-text-main'
          }`}>
            Home
          </span>
          {isHomeActive && (
            <span className="w-1.5 h-1 bg-primary rounded-full mt-0.5" />
          )}
        </Link>

        {/* 2. Categories Drawer Trigger */}
        <button
          type="button"
          onClick={openCategoryDrawer}
          className="flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer rounded-button active:scale-95 px-0.5 min-w-0"
          aria-label="Open Categories"
        >
          <div className="relative flex items-center justify-center">
            <LayoutGrid className={`w-[18px] h-[18px] transition-transform ${
              isCategoryActive ? 'text-primary stroke-[2.5] scale-105' : 'text-text-muted stroke-[1.75] hover:text-text-main'
            }`} />
          </div>
          <span className={`text-2xs mt-1 leading-none truncate max-w-full ${
            isCategoryActive ? 'text-primary font-semibold' : 'text-text-muted font-medium hover:text-text-main'
          }`}>
            Category
          </span>
          {isCategoryActive && (
            <span className="w-1.5 h-1 bg-primary rounded-full mt-0.5" />
          )}
        </button>

        {/* 3. Flash Deals (Prominent with Flame Accent) */}
        <Link
          href="/best-deals"
          className="flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer rounded-button active:scale-95 px-0.5 min-w-0"
        >
          <div className="relative flex items-center justify-center">
            <Flame className={`w-[19px] h-[19px] transition-transform ${
              isDealsActive ? 'text-primary stroke-[2.5] fill-primary/25 scale-110' : 'text-text-muted stroke-[1.75] hover:text-primary'
            }`} />
            <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <span className={`text-2xs mt-1 leading-none truncate max-w-full ${
            isDealsActive ? 'text-primary font-semibold' : 'text-text-muted font-medium hover:text-primary'
          }`}>
            Deals
          </span>
          {isDealsActive && (
            <span className="w-1.5 h-1 bg-primary rounded-full mt-0.5" />
          )}
        </Link>

        {/* 4. Products (All Products) */}
        <Link
          href="/shop"
          className="flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer rounded-button active:scale-95 px-0.5 min-w-0"
        >
          <div className="relative flex items-center justify-center">
            <ShoppingBag className={`w-[18px] h-[18px] transition-transform ${
              isShopActive ? 'text-primary stroke-[2.5] scale-105' : 'text-text-muted stroke-[1.75] hover:text-text-main'
            }`} />
          </div>
          <span className={`text-2xs mt-1 leading-none truncate max-w-full ${
            isShopActive ? 'text-primary font-semibold' : 'text-text-muted font-medium hover:text-text-main'
          }`}>
            Shop
          </span>
          {isShopActive && (
            <span className="w-1.5 h-1 bg-primary rounded-full mt-0.5" />
          )}
        </Link>

        {/* 5. Returns */}
        <Link
          href="/returns"
          className="flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer rounded-button active:scale-95 px-0.5 min-w-0"
          aria-label="Returns"
        >
          <div className="relative flex items-center justify-center">
            <RotateCcw className={`w-[18px] h-[18px] transition-transform ${
              isReturnActive ? 'text-primary stroke-[2.5] scale-105' : 'text-text-muted stroke-[1.75] hover:text-text-main'
            }`} />
          </div>
          <span className={`text-2xs mt-1 leading-none truncate max-w-full ${
            isReturnActive ? 'text-primary font-semibold' : 'text-text-muted font-medium hover:text-text-main'
          }`}>
            Returns
          </span>
          {isReturnActive && (
            <span className="w-1.5 h-1 bg-primary rounded-full mt-0.5" />
          )}
        </Link>

        {/* 6. Account */}
        <Link
          href="/account"
          className="flex flex-col items-center justify-center h-full transition-all duration-200 cursor-pointer rounded-button active:scale-95 px-0.5 min-w-0"
        >
          <div className="relative flex items-center justify-center">
            <User className={`w-[18px] h-[18px] transition-transform ${
              isAccountActive ? 'text-primary stroke-[2.5] scale-105' : 'text-text-muted stroke-[1.75] hover:text-text-main'
            }`} />
          </div>
          <span className={`text-2xs mt-1 leading-none truncate max-w-full ${
            isAccountActive ? 'text-primary font-semibold' : 'text-text-muted font-medium hover:text-text-main'
          }`}>
            Account
          </span>
          {isAccountActive && (
            <span className="w-1.5 h-1 bg-primary rounded-full mt-0.5" />
          )}
        </Link>

      </nav>
    </div>
  );
}
