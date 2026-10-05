/**
 * @file components/product/ProductCard.tsx
 * @description Unified, world-class e-commerce product card used consistently across all store pages.
 * Supports both:
 * 1. 'grid' layout (Compact, uniform height e-commerce card with badges, rating, pricing, and cart button)
 * 2. 'list' layout (True horizontal card with square image on left and structured details on right for all screen sizes)
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Check, Flame, ShoppingBag, Truck } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { useHydrated } from '@/hooks/useHydrated';
import { formatBDT } from '@/lib/formatCurrency';
import { 
  normalizeProductMedia, 
  getProductHoverGif, 
  getProductDisplayImage,
  getProductSecondaryImage
} from '@/lib/mediaUtils';

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
  layout?: 'grid' | 'list';
}

export const ProductCard = React.memo(function ProductCard({ 
  product, 
  priority = false,
  layout = 'grid'
}: ProductCardProps) {
  const showDiscountBadge = useSiteSettingsStore((state) => state.showDiscountBadge ?? true);
  const showFlashBadge = useSiteSettingsStore((state) => state.showFlashBadge ?? true);
  const showTrendingBadge = useSiteSettingsStore((state) => state.showTrendingBadge ?? true);
  const showHotDealBadge = useSiteSettingsStore((state) => state.showHotDealBadge ?? true);
  const showNewBadge = useSiteSettingsStore((state) => state.showNewBadge ?? true);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlisted = useWishlistStore((state) => state.items.some((item) => item.id === product.id));

  const hydrated = useHydrated();
  const inWishlist = hydrated && wishlisted;
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  // Extract media items in admin-defined sequence
  const mediaList = React.useMemo(() => normalizeProductMedia(product), [product]);
  const primaryMedia = mediaList[0];
  const hoverGif = React.useMemo(() => getProductHoverGif(product), [product]);

  const primaryImage = React.useMemo(() => getProductDisplayImage(product), [product]);
  const secondaryImage = React.useMemo(() => getProductSecondaryImage(product), [product]);

  const [imgSrc, setImgSrc] = useState<string>(primaryImage);

  // Keep imgSrc updated if product primary image changes
  React.useEffect(() => {
    setImgSrc(primaryImage);
  }, [primaryImage]);

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : (product.discountPercent || null);

  const savingsAmount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(product.originalPrice - product.price)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const displayName = product.name;
  const displayCategory = product.category;

  /* ========================================================================
   * 1. LIST VIEW LAYOUT (TRUE HORIZONTAL ROW ON MOBILE & DESKTOP)
   * ======================================================================== */
  if (layout === 'list') {
    return (
      <article 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-row items-stretch bg-white rounded-2xl border border-border-color/90 shadow-2xs hover:shadow-md hover:border-border-hover transition-all duration-200 overflow-hidden p-2.5 sm:p-4 gap-3 sm:gap-4.5 gpu-smooth w-full"
      >
        {/* Left Side: Square Product Image with Badges & Wishlist */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 aspect-square rounded-xl overflow-hidden bg-surface-subtle border border-border-color/60 shrink-0">
          <Link href={`/product/${product.id}`} prefetch={false} className="block w-full h-full relative cursor-pointer z-1">
            {/* Primary Cover Image */}
            <Image
              src={imgSrc}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 112px, 176px"
              priority={priority}
              loading={priority ? undefined : "lazy"}
              unoptimized={primaryMedia?.type === 'gif'}
              referrerPolicy="no-referrer"
              onError={() => {
                setImgSrc('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80');
              }}
              className={`object-cover object-center transition-all duration-300 ease-out ${
                isHovered && ((hoverGif && hoverGif !== imgSrc) || secondaryImage)
                  ? 'opacity-0 scale-105' 
                  : 'opacity-100 group-hover:scale-105'
              }`}
            />

            {/* Hover Animated GIF preview - Only mounted on hover to prevent massive page load delay */}
            {isHovered && hoverGif && hoverGif !== imgSrc && (
              <Image
                src={hoverGif}
                alt={`${displayName} Animated Preview`}
                fill
                unoptimized
                sizes="(max-width: 640px) 112px, 176px"
                referrerPolicy="no-referrer"
                className="object-cover object-center absolute inset-0 transition-opacity duration-300 ease-out opacity-100 scale-105"
              />
            )}

            {/* Secondary Alternate Image on Hover - Only mounted on hover */}
            {isHovered && !hoverGif && secondaryImage && (
              <Image
                src={secondaryImage}
                alt={`${displayName} Alternate`}
                fill
                sizes="(max-width: 640px) 112px, 176px"
                referrerPolicy="no-referrer"
                className="object-cover object-center absolute inset-0 transition-opacity duration-300 ease-out opacity-100 scale-105"
              />
            )}
          </Link>

          {/* Top-Left: Discount Badges */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {discountPercent && (showDiscountBadge !== false) && (product.showDiscountBadge !== false) && (
              <span className="px-1.5 py-0.5 rounded-md bg-primary text-white text-2xs sm:text-2xs font-black uppercase tracking-wider shadow-xs">
                -{discountPercent}%
              </span>
            )}
            {product.isFlashDeal && (showFlashBadge !== false) && (product.showFlashBadge !== false) && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-2xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-current text-white" />
                <span className="hidden sm:inline">HOT</span>
              </span>
            )}
          </div>

          {/* Top-Right: Wishlist Heart */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
              inWishlist 
                ? 'bg-primary border-primary text-white shadow-xs' 
                : 'bg-white/90 backdrop-blur-xs hover:bg-white border-border-color text-text-muted hover:text-primary shadow-2xs'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current text-white' : ''}`} />
          </button>
        </div>

        {/* Right Side: Structured Details, Pricing & Cart Action */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5 sm:py-1">
          <div>
            {/* Category & Star Rating */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-2xs sm:text-2xs font-bold uppercase tracking-wider text-text-muted truncate min-w-0">
                {displayCategory}
              </span>

              <div className="flex items-center gap-0.5 sm:gap-1 text-2xs sm:text-2xs font-bold text-text-main bg-surface-subtle px-1.5 py-0.5 rounded-md border border-border-color shrink-0">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500 shrink-0" />
                <span className="font-extrabold">{product.rating ? (product.rating ?? 0).toFixed(1) : '4.8'}</span>
                <span className="text-text-muted font-normal hidden sm:inline">({product.reviewCount ?? 34})</span>
              </div>
            </div>

            {/* Product Title (2-Line Clamp) */}
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-text-main group-hover:text-primary transition-colors leading-snug line-clamp-2">
              <Link href={`/product/${product.id}`} prefetch={false} className="hover:underline">
                {displayName}
              </Link>
            </h3>

            {/* Specs / Description snippet (desktop / tablet) */}
            <p className="hidden sm:line-clamp-1 text-xs text-text-muted mt-1 leading-relaxed">
              {product.description}
            </p>

            {/* Color Swatches if available */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-2xs sm:text-2xs text-text-muted font-medium hidden sm:inline">
                  {'Colors:'}
                </span>
                <div className="flex items-center gap-1">
                  {product.colors.slice(0, 4).map((c, i) => (
                    <span 
                      key={i}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-border-hover shadow-2xs"
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-2xs text-text-muted font-medium">+{product.colors.length - 4}</span>
                  )}
                </div>
              </div>
            )}

            {/* Reassurance Tag */}
            <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-2xs sm:text-2xs text-emerald-700 font-bold truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span className="truncate">{'In Stock • 2-3 Days Delivery'}</span>
            </div>
          </div>

          {/* Bottom Bar: Price & Add to Cart Button */}
          <div className="mt-auto pt-2 border-t border-border-color/60 flex items-center justify-between gap-2">
            {/* Pricing Section */}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-lg font-black text-text-main font-sans tracking-tight">
                {formatBDT(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-2xs sm:text-xs text-text-subtle line-through font-semibold">
                  {formatBDT(product.originalPrice)}
                </span>
              )}
              {discountPercent && (
                <span className="text-2xs sm:text-2xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded hidden xs:inline">
                  {savingsAmount > 0 ? `৳${savingsAmount} ছাড়` : `-${discountPercent}%`}
                </span>
              )}
            </div>

            {/* Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`h-7 sm:h-8.5 px-3 sm:px-4 rounded-xl font-bold text-2xs sm:text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0 ${
                added
                  ? 'bg-zinc-950 text-white border border-border-dark ring-2 ring-primary/20'
                  : 'bg-surface-dark hover:bg-primary text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3] text-primary" />
                  <span className="font-bold text-white">{'Added'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  <span>{'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  }

  /* ========================================================================
   * 2. GRID VIEW LAYOUT (STANDARD UNIFIED E-COMMERCE CARD)
   * ======================================================================== */
  return (
    <article 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-border-color/90 shadow-2xs hover:shadow-md hover:border-border-hover transition-all duration-200 overflow-hidden p-2.5 sm:p-3 gpu-smooth h-full"
    >
      {/* Top Media Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface-subtle border border-border-color/60 mb-2.5">
        <Link href={`/product/${product.id}`} prefetch={false} className="block w-full h-full relative cursor-pointer z-1">
          {/* Primary Cover Image */}
          <Image
            src={imgSrc}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
            unoptimized={primaryMedia?.type === 'gif'}
            referrerPolicy="no-referrer"
            onError={() => {
              setImgSrc('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80');
            }}
            className={`object-cover object-center transition-all duration-300 ease-out ${
              isHovered && ((hoverGif && hoverGif !== imgSrc) || secondaryImage)
                ? 'opacity-0 scale-105' 
                : 'opacity-100 group-hover:scale-105'
            }`}
          />

          {/* Hover Animated GIF Preview - Only mounted on hover to prevent massive page load delay */}
          {isHovered && hoverGif && hoverGif !== imgSrc && (
            <Image
              src={hoverGif}
              alt={`${displayName} - Animated GIF Preview`}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              referrerPolicy="no-referrer"
              className="object-cover object-center absolute inset-0 transition-all duration-300 ease-out opacity-100 scale-105"
            />
          )}

          {/* Secondary Alternate Image on Hover - Only mounted on hover */}
          {isHovered && !hoverGif && secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${displayName} - Alternate View`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              referrerPolicy="no-referrer"
              className="object-cover object-center absolute inset-0 transition-all duration-300 ease-out opacity-100 scale-105"
            />
          )}
        </Link>

        {/* Top-Left: Badge Stack (Discount, Flash, Trending, Best Deal, New) */}
        <div className="absolute top-2 left-0 z-20 flex flex-col items-start gap-1 pointer-events-none">
          {discountPercent && (showDiscountBadge !== false) && (product.showDiscountBadge !== false) && (
            <span className="px-2 py-0.5 rounded-e-md bg-primary text-white text-xs sm:text-sm font-bold flex items-center gap-1 shadow-md">
              <span className="font-semibold text-xs sm:text-xs">{'Save'}</span>
              <span className="text-xs font-bold">৳</span>
              <span className="font-extrabold">{savingsAmount > 0 ? savingsAmount : `${discountPercent}%`}</span>
            </span>
          )}
          {product.isFlashDeal && (showFlashBadge !== false) && (product.showFlashBadge !== false) && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-2xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 fill-current text-white" />
              <span>FLASH</span>
            </span>
          )}
          {product.isTrending && !product.isFlashDeal && (showTrendingBadge !== false) && (product.showTrendingBadge !== false) && (
            <span className="px-1.5 py-0.5 rounded-md bg-orange-600 text-white text-2xs font-bold uppercase tracking-wider shadow-xs">
              🔥 TRENDING
            </span>
          )}
          {product.isBestDeal && !product.isFlashDeal && !product.isTrending && (showHotDealBadge !== false) && (product.showHotDealBadge !== false) && (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-2xs font-bold uppercase tracking-wider shadow-xs">
              🏷️ HOT DEAL
            </span>
          )}
          {product.isNew && !product.isFlashDeal && !product.isTrending && !product.isBestDeal && (showNewBadge !== false) && (product.showNewBadge !== false) && (
            <span className="px-1.5 py-0.5 rounded-md bg-surface-dark text-white text-2xs font-bold uppercase tracking-wider shadow-xs">
              ✨ NEW
            </span>
          )}
        </div>

        {/* Top-Right: Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 z-20 w-7.5 h-7.5 rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-90 ${
            inWishlist 
              ? 'bg-primary border-primary text-white shadow-xs' 
              : 'bg-white/90 backdrop-blur-xs hover:bg-white border-border-color text-text-muted hover:text-primary shadow-2xs'
          }`}
        >
          <Heart 
            className={`w-3.5 h-3.5 transition-transform ${inWishlist ? 'fill-current scale-105' : ''}`} 
          />
        </button>

        {/* Bottom Swatches overlay if multi-colors available */}
        {product.colors && product.colors.length > 1 && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-white/95 px-1.5 py-0.5 rounded-full border border-border-color shadow-2xs">
            {product.colors.slice(0, 3).map((c, i) => (
              <span
                key={i}
                style={{ backgroundColor: c.hex }}
                className="w-2 h-2 rounded-full border border-border-hover"
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-2xs font-bold text-text-muted leading-none">+{product.colors.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1">
        {/* Row 1: Category & Social-Proof Rating */}
        <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
          <span className="text-2xs sm:text-xs font-bold uppercase tracking-wider text-text-muted truncate min-w-0">
            {displayCategory}
          </span>

          <div className="flex items-center gap-0.5 sm:gap-1 text-2xs sm:text-xs font-bold text-text-main bg-surface-subtle px-1.5 py-0.5 rounded-md border border-border-color shrink-0">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500 shrink-0" />
            <span className="font-extrabold text-text-main">{product.rating ? (product.rating ?? 0).toFixed(1) : '4.8'}</span>
            <span className="text-text-muted font-semibold text-2xs hidden sm:inline">
              ({product.reviewCount ?? 28})
            </span>
          </div>
        </div>

        {/* Row 2: Product Name (Uniform 2-line clamp for neat alignment across all cards) */}
        <h3 className="text-xs sm:text-sm font-bold text-text-main line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[2rem] sm:min-h-[2.5rem]">
          <Link href={`/product/${product.id}`} prefetch={false} className="hover:underline text-text-main font-bold">
            {displayName}
          </Link>
        </h3>

        {/* Row 3: Reassurance micro tag (In Stock) */}
        <div className="mt-1 flex items-center gap-1 text-2xs sm:text-xs text-text-muted font-medium truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span className="truncate">{'In Stock • 2-3 Days'}</span>
        </div>

        {/* Bottom Row: Price & Tactile Cart Action Button */}
        <div className="mt-auto pt-2 border-t border-border-color/60 flex items-center justify-between gap-1.5">
          {/* Price Container */}
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-lg font-black text-text-main font-sans tracking-tight truncate">
              {formatBDT(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-2xs sm:text-xs text-text-subtle line-through font-semibold truncate">
                {formatBDT(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Professional Action Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={added ? 'Added to cart' : 'Add to cart'}
            className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-xl font-bold text-2xs sm:text-xs flex items-center gap-1 transition-all duration-200 cursor-pointer shrink-0 active:scale-95 shadow-2xs ${
              added
                ? 'bg-zinc-950 text-white border border-border-dark ring-2 ring-primary/20'
                : 'bg-surface-dark hover:bg-primary text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3] text-primary" />
                <span className="hidden xs:inline font-bold text-white">{'Added'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>{'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});
