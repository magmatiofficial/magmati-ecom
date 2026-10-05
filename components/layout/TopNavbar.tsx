/**
 * @file components/layout/TopNavbar.tsx
 * @description Desktop top navbar with modular search dropdown, mega menu, and action icons.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Search, Flame, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUIStore } from '@/store/useUIStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { products } from '@/data/products';
import { Product } from '@/types';
import { NavbarSearchDropdown } from '@/components/layout/NavbarSearchDropdown';
import { NavbarCategoryMegaMenu } from '@/components/layout/NavbarCategoryMegaMenu';
import { NavbarActionIcons } from '@/components/layout/NavbarActionIcons';
import { useHydrated } from '@/hooks/useHydrated';

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { categories } = useCategoryStore();
  const mounted = useHydrated();

  const cartItems = useCartStore((state) => state.items);
  const totalCartItems = React.useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const totalCartPrice = React.useMemo(() => cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cartItems]);
  const openCart = useCartStore((state) => state.openCart);

  const totalWishlistItems = useWishlistStore((state) => state.items.length);
  const openWishlist = useWishlistStore((state) => state.openWishlist);

  const { searchQuery, setSearchQuery, closeSearch } = useUIStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = React.useRef<HTMLDivElement>(null);
  const closeCategoryTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCategoryMouseEnter = () => {
    if (closeCategoryTimeoutRef.current) {
      clearTimeout(closeCategoryTimeoutRef.current);
      closeCategoryTimeoutRef.current = null;
    }
    setCategoryDropdownOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    if (closeCategoryTimeoutRef.current) {
      clearTimeout(closeCategoryTimeoutRef.current);
    }
    closeCategoryTimeoutRef.current = setTimeout(() => {
      setCategoryDropdownOpen(false);
    }, 180);
  };

  // Close dropdowns on outside click or Escape key
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setCategoryDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setSearchFocused(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCategoryDropdownOpen(false);
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeCategoryTimeoutRef.current) {
        clearTimeout(closeCategoryTimeoutRef.current);
      }
    };
  }, []);

  const searchResults = searchQuery.trim()
    ? products.filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.subcategory.toLowerCase().includes(query)
        );
      }).slice(0, 6)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      closeSearch();
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSearchFocused(false);
    closeSearch();
    router.push(`/product/${product.id}`);
  };

  const handleSearchCategory = (term: string) => {
    setSearchFocused(false);
    closeSearch();
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  };

  const mainNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/best-deals', label: 'Best Deals', isHot: true },
    { href: '/returns', label: 'Returns Request', isReturn: true },
    { href: '/track', label: 'Track Order' },
  ];

  return (
    <header className="hidden md:block w-full bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-xs gpu-smooth">
      {/* Main Desktop Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-5">
          {/* Brand Logo */}
          <BrandLogo size="sm" />

          {/* Desktop Search Bar with Live Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search for garments, electronics..."
                className="w-full h-10 pl-9 pr-24 rounded-input bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-22 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  title="Clear"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-4 bg-primary hover:bg-primary-hover text-white rounded-button text-xs font-bold transition-all uppercase tracking-wider shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
              >
                {'Search'}
              </button>
            </form>

            {/* Quick Live Search Dropdown */}
            {searchFocused && (
              <NavbarSearchDropdown
                searchQuery={searchQuery}
                searchResults={searchResults}
                onSelectProduct={handleSelectProduct}
                onSearchCategory={handleSearchCategory}
                onClose={() => setSearchFocused(false)}
              />
            )}
          </div>

          {/* User Action Icons */}
          <NavbarActionIcons
            mounted={mounted}
            totalCartItems={totalCartItems}
            totalCartPrice={totalCartPrice}
            openCart={openCart}
            totalWishlistItems={totalWishlistItems}
            openWishlist={openWishlist}
          />
        </div>
      </div>

      {/* Categories Department Strip & Store Links */}
      <div className="border-t border-zinc-100 bg-zinc-50/70">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-1.5" aria-label="Main Navigation">
          <div className="flex items-center gap-6">
            {/* Mega Categories Button & Menu */}
            <div 
              ref={categoryDropdownRef}
              onMouseEnter={handleCategoryMouseEnter}
              onMouseLeave={handleCategoryMouseLeave}
            >
              <NavbarCategoryMegaMenu
                categories={categories}
                isOpen={categoryDropdownOpen}
                onToggle={() => setCategoryDropdownOpen((prev) => !prev)}
                onClose={() => setCategoryDropdownOpen(false)}
                navCategoryLabel="Categories"
              />
            </div>

            {/* Store Navigation Links */}
            <ul className="flex items-center gap-6 text-xs font-semibold">
              {mainNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`inline-flex items-center gap-1.5 py-1.5 transition-all relative text-xs tracking-normal ${
                        isActive
                          ? 'text-primary font-bold'
                          : 'text-zinc-700 hover:text-primary'
                      }`}
                    >
                      {link.isHot && <Flame className="w-3.5 h-3.5 text-primary fill-primary/20 animate-pulse" />}
                      <span>{link.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
