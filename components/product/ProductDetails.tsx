/**
 * @file components/product/ProductDetails.tsx
 * @description Product details control panel with modular variants, guarantees, and tabs.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Check, 
  Plus, 
  Minus, 
  Flame,
} from 'lucide-react';
import { Product, ProductColor } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useHydrated } from '@/hooks/useHydrated';
import { formatBDT } from '@/lib/formatCurrency';
import { Button } from '@/components/ui/Button';
import { ProductVariantSelector } from '@/components/product/ProductVariantSelector';
import { ProductGuarantees } from '@/components/product/ProductGuarantees';
import { ProductInfoTabs } from '@/components/product/ProductInfoTabs';

export interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlisted = useWishlistStore((state) => state.items.some((item) => item.id === product.id));

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors?.[0] || { name: 'Standard', hex: '#000000' }
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'delivery'>('details');
  const [isAddedToast, setIsAddedToast] = useState(false);

  const hydrated = useHydrated();
  const inWishlist = hydrated && wishlisted;
  const isAvailable = product.inStock !== false && (product.stockQuantity === undefined || product.stockQuantity > 0);
  const maxAvailable = product.stockQuantity && product.stockQuantity > 0 ? Math.min(product.stockQuantity, 10) : 10;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem(product, selectedSize, selectedColor, quantity);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addItem(product, selectedSize, selectedColor, quantity);
    useCartStore.getState().closeCart();
    router.push('/cart');
  };

  return (
    <div className="flex flex-col font-sans">
      {/* Toast Notification */}
      {isAddedToast && (
        <div className="fixed top-20 right-4 z-50 bg-zinc-950 text-white text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-zinc-800 animate-in fade-in slide-in-from-top-2">
          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span className="font-medium text-zinc-100">
            {'Added to your shopping bag!'}
          </span>
        </div>
      )}

      {/* Category & SKU */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
        <span className="text-primary font-bold uppercase tracking-wider">
          {product.category}
        </span>
        <span>SKU: {product.sku}</span>
      </div>

      {/* Title */}
      <h1 className="font-sans text-2xl sm:text-3xl font-bold text-app-text leading-tight mb-3">
        {product.name}
      </h1>

      {/* Rating & Reviews */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-4 h-4 fill-amber-500" />
          <span className="text-xs font-bold text-zinc-900 font-mono">{product.rating}</span>
        </div>
        <span className="text-xs text-zinc-400">•</span>
        <span className="text-xs text-zinc-500">
          {product.reviewCount} {'Verified Reviews'}
        </span>
        {product.isBestDeal && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-2xs font-bold uppercase tracking-wider">
            <Flame className="w-3 h-3 text-primary fill-primary" />
            {'Flash Deal'}
          </span>
        )}

        {/* Stock Status Badge */}
        {!isAvailable ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-zinc-600 text-xs font-bold">
            {'Out of Stock'}
          </span>
        ) : product.stockQuantity && product.stockQuantity <= 5 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            🔥 {`Only ${product.stockQuantity} left!`}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
            {'In Stock'}
          </span>
        )}
      </div>

      {/* Price Block */}
      <div className="p-4 rounded-card bg-surface-subtle border border-border-token/80 mb-6 flex items-baseline gap-3">
        <span className="font-sans text-2xl sm:text-3xl font-bold text-app-text">
          {formatBDT(product.price)}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <span className="font-sans text-sm sm:text-base text-app-muted line-through">
              {formatBDT(product.originalPrice)}
            </span>
            {product.discountPercent && (
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white text-2xs font-extrabold tracking-tight shadow-xs">
                {product.originalPrice && product.originalPrice > product.price
                  ? (`৳${Math.round(product.originalPrice - product.price)} OFF`)
                  : `-${product.discountPercent}%`}
              </span>
            )}
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-app-muted leading-relaxed mb-6 font-normal">
        {product.description}
      </p>

      {/* Variant Selector (Colors & Sizes) */}
      <ProductVariantSelector
        
        product={product}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
      />

      {/* Sleek Inline Quantity Selector */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
        <span className="text-xs font-bold uppercase tracking-wider text-app-text">
          {'Quantity'}:
        </span>
        <div className="flex items-center justify-between bg-surface-subtle border border-border-token rounded-xl h-10 px-3 w-28 shrink-0 transition-all">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={!isAvailable || quantity <= 1}
            className="text-app-muted hover:text-app-text disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-transform p-0.5 cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3 stroke-[2.5]" />
          </button>
          <span className="font-sans text-xs font-bold text-app-text font-mono select-none">
            {isAvailable ? quantity : 0}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
            disabled={!isAvailable || quantity >= maxAvailable}
            className="text-app-muted hover:text-app-text disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-transform p-0.5 cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-2 mb-6">
        {/* ADD TO BAG Button */}
        <Button
          variant="primary"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`flex-1 h-10 sm:h-11 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer ${
            isAvailable
              ? 'bg-primary hover:bg-primary-hover text-white'
              : 'bg-surface-subtle text-app-muted cursor-not-allowed shadow-none hover:bg-surface-subtle'
          }`}
        >
          <ShoppingBag className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">
            {isAvailable
              ? ('Add to Bag')
              : ('Out of Stock')}
          </span>
        </Button>

        {/* BUY NOW Button */}
        <Button
          variant="secondary"
          onClick={handleBuyNow}
          disabled={!isAvailable}
          className={`flex-1 h-10 sm:h-11 rounded-xl flex items-center justify-center text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer ${
            isAvailable
              ? 'bg-zinc-950 hover:bg-zinc-800 text-white'
              : 'bg-surface-subtle text-app-muted cursor-not-allowed shadow-none hover:bg-surface-subtle'
          }`}
        >
          <span className="whitespace-nowrap">
            {isAvailable
              ? ('Buy Now')
              : ('Unavailable')}
          </span>
        </Button>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className={`w-10 h-10 sm:w-11 sm:h-11 border rounded-xl transition-all flex items-center justify-center shrink-0 shadow-2xs active:scale-95 cursor-pointer ${
            inWishlist
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-border-token bg-surface text-app-text hover:border-app-muted hover:bg-surface-subtle'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4.5 h-4.5 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
        </button>
      </div>

      {/* Guarantees Box */}
      <ProductGuarantees  />

      {/* Overview, Specs & Delivery Tabs */}
      <ProductInfoTabs
        
        product={product}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
