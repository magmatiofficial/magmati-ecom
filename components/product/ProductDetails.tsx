/**
 * @file components/product/ProductDetails.tsx
 * @description Product details control panel with modular variants, guarantees, and tabs.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Star, Check, Plus, Minus, Flame } from 'lucide-react';
import { Product, ProductColor } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useHydrated } from '@/hooks/useHydrated';
import { formatBDT } from '@/lib/formatCurrency';
import { Button } from '@/components/ui/Button';
import { ProductVariantSelector } from '@/components/product/ProductVariantSelector';
import { ProductGuarantees } from '@/components/product/ProductGuarantees';
import { ProductInfoTabs } from '@/components/product/ProductInfoTabs';
import { toast } from '@/store/useToastStore';

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

  const hydrated = useHydrated();
  const inWishlist = hydrated && wishlisted;
  const isAvailable = product.inStock !== false && (product.stockQuantity === undefined || product.stockQuantity > 0);
  const maxAvailable = product.stockQuantity && product.stockQuantity > 0 ? Math.min(product.stockQuantity, 10) : 10;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem(product, selectedSize, selectedColor, quantity);
    toast.success(`${product.name} was added to your shopping bag.`, 'Added to cart');
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addItem(product, selectedSize, selectedColor, quantity);
    useCartStore.getState().closeCart();
    router.push('/cart');
  };

  return (
    <div className="flex flex-col font-sans">
      {/* Category & SKU */}
      <div className="flex items-center justify-between text-xs text-text-muted mb-1 font-mono">
        <span className="text-primary font-medium">
          {product.category}
        </span>
        <span>SKU: {product.sku}</span>
      </div>

      {/* Title */}
      <h1 className="font-sans text-lg sm:text-2xl lg:text-3xl font-bold text-app-text leading-snug line-clamp-2 lg:line-clamp-none mb-2">
        {product.name}
      </h1>

      {/* Rating & Reviews */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-4 h-4 fill-amber-500" />
          <span className="text-xs font-medium text-text-main font-mono">{product.rating}</span>
        </div>
        <span className="text-xs text-text-muted">•</span>
        <span className="text-xs text-text-muted">
          {product.reviewCount} {'Verified Reviews'}
        </span>
        {product.isBestDeal && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-2xs font-bold uppercase tracking-wider">
            <Flame className="w-3 h-3 text-primary fill-primary" />
            {'Flash Deal'}
          </span>
        )}

        {/* Stock Status Badge */}
        {!isAvailable ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-subtle border border-border-color text-text-muted text-xs font-medium">
            {'Out of Stock'}
          </span>
        ) : product.stockQuantity && product.stockQuantity <= 5 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            🔥 {`Only ${product.stockQuantity} left!`}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
            {'In Stock'}
          </span>
        )}
      </div>

      {/* Price Block */}
      <div className="p-2.5 sm:p-3 rounded-card bg-surface-subtle border border-border-token/80 mb-3 flex items-baseline gap-3">
        <span className="font-sans text-xl sm:text-2xl font-bold text-app-text">
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
      <div
        className="text-xs sm:text-sm text-app-muted leading-relaxed mb-3 font-normal prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: product.description || '' }}
      />

      {/* Variant Selector (Colors & Sizes) */}
      <ProductVariantSelector
        
        product={product}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
      />

      {/* Main Action Buttons & Quantity Stepper */}
      <div className="flex items-center gap-2 mb-4">
        {/* Sleek Inline Quantity Stepper */}
        <div className="flex items-center justify-between bg-surface-subtle border border-border-token rounded-lg h-8 sm:h-9 px-2 w-[4.5rem] sm:w-20 shrink-0 transition-all">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={!isAvailable || quantity <= 1}
            className="text-app-muted hover:text-app-text disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-transform p-0.5 cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3 stroke-[2.5]" />
          </button>
          <span className="font-sans text-xs font-medium text-text-main font-mono select-none">
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

        {/* ADD TO CART Button */}
        <Button
          variant="primary"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`flex-1 sm:flex-none h-8 sm:h-9 min-h-0 py-0 px-3 sm:px-5 rounded-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-none hover:shadow-sm active:scale-[0.98] cursor-pointer ${
            isAvailable
              ? 'bg-surface text-primary border border-primary hover:bg-primary-subtle'
              : 'bg-surface-subtle text-app-muted cursor-not-allowed shadow-none hover:bg-surface-subtle'
          }`}
        >
          <ShoppingBag className="w-4 h-4 shrink-0 hidden sm:block" />
          <span className="whitespace-nowrap">
            {isAvailable
              ? ('Add to Cart')
              : ('Out of Stock')}
          </span>
        </Button>

        {/* BUY NOW Button */}
        <Button
          variant="secondary"
          onClick={handleBuyNow}
          disabled={!isAvailable}
          className={`flex-1 sm:flex-none h-8 sm:h-9 min-h-0 py-0 px-3 sm:px-5 rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-200 shadow-none hover:shadow-sm active:scale-[0.98] cursor-pointer ${
            isAvailable
              ? 'bg-primary hover:bg-primary-hover text-white'
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
          className={`w-8 h-8 sm:w-9 sm:h-9 border rounded-lg transition-all flex items-center justify-center shrink-0 shadow-2xs active:scale-95 cursor-pointer ${
            inWishlist
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-border-token bg-surface text-app-text hover:border-app-muted hover:bg-surface-subtle'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
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
