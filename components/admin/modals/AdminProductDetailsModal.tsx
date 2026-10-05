'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  Package, 
  Tag, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles,
  ShoppingBag,
  Info,
  Palette,
  Ruler
} from 'lucide-react';
import { Product } from '@/types';
import { formatBDT as defaultFormatBDT } from '@/lib/formatCurrency';

export interface AdminProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  orderItemContext?: {
    selectedSize?: string;
    selectedColor?: { name: string; hex: string };
    quantity?: number;
    customPrice?: number;
  } | null;
  formatBDT?: (amount: number) => string;
}

export const AdminProductDetailsModal: React.FC<AdminProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  orderItemContext,
  formatBDT = defaultFormatBDT,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Reset active image on modal open / product change
  useEffect(() => {
    setActiveImageIndex(0);
    setImageError(false);
  }, [product?.id, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  // Resolve all image candidates safely
  const candidateImages: string[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach((img) => {
      if (typeof img === 'string' && img.trim()) candidateImages.push(img.trim());
    });
  }
  if (product.image && typeof product.image === 'string' && !candidateImages.includes(product.image.trim())) {
    candidateImages.unshift(product.image.trim());
  }

  const currentImageUrl = candidateImages[activeImageIndex] || candidateImages[0] || '';
  const price = typeof orderItemContext?.customPrice === 'number' ? orderItemContext.customPrice : (product.price || 0);
  const originalPrice = product.originalPrice;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : (product.discountPercent || 0);

  const stockQuantity = typeof product.stockQuantity === 'number' ? product.stockQuantity : 50;
  const isOutOfStock = stockQuantity <= 0 || product.inStock === false;
  const isLowStock = !isOutOfStock && stockQuantity <= (product.lowStockThreshold || 5);

  return (
    <div 
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-zinc-200 my-auto max-h-[90dvh] overflow-y-auto custom-scrollbar flex flex-col font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-extrabold uppercase tracking-widest text-primary font-mono bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  Catalog Product Details
                </span>
                {product.sku && (
                  <span className="text-2xs font-mono font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                    SKU: {product.sku}
                  </span>
                )}
              </div>
              <h2 id="product-details-modal-title" className="text-base sm:text-lg font-black text-zinc-950 mt-0.5 line-clamp-1">
                {product.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column: Product Imagery */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-xs flex items-center justify-center">
              {currentImageUrl && !imageError ? (
                <Image
                  src={currentImageUrl}
                  alt={product.name || 'Product Image'}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  sizes="(max-width: 768px) 100vw, 360px"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                  <Package className="w-12 h-12 text-zinc-300 stroke-[1.5] mb-2" />
                  <span className="text-xs font-semibold text-zinc-500">Image not available</span>
                  <span className="text-2xs text-zinc-400 mt-1 font-mono">ID: {product.id}</span>
                </div>
              )}

              {/* Status Badges on Image */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                {isOutOfStock ? (
                  <span className="px-2.5 py-1 rounded-lg text-2xs font-extrabold uppercase bg-red-600 text-white shadow-xs">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-2.5 py-1 rounded-lg text-2xs font-extrabold uppercase bg-amber-500 text-white shadow-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Low Stock ({stockQuantity})
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-2xs font-extrabold uppercase bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    In Stock ({stockQuantity})
                  </span>
                )}

                {hasDiscount && (
                  <span className="px-2.5 py-1 rounded-lg text-2xs font-extrabold uppercase bg-primary text-white shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Gallery Thumbnails (if multiple images) */}
            {candidateImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {candidateImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setImageError(false);
                    }}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-primary ring-2 ring-primary/20 scale-102'
                        : 'border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Complete Product Meta & Attributes */}
          <div className="space-y-4">
            {/* Category & Brand Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.category && (
                <span className="inline-flex items-center gap-1 text-2xs font-extrabold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 uppercase">
                  <Tag className="w-3 h-3 text-zinc-500" />
                  {product.category}
                </span>
              )}
              {product.subcategory && (
                <span className="inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200 uppercase">
                  <Layers className="w-3 h-3 text-zinc-400" />
                  {product.subcategory}
                </span>
              )}
              {product.brand && (
                <span className="inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-1 rounded-lg bg-red-50 text-primary border border-red-200 uppercase">
                  <Sparkles className="w-3 h-3" />
                  {product.brand}
                </span>
              )}
            </div>

            {/* Price Box */}
            <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-zinc-400 block">
                Pricing Overview
              </span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl sm:text-2xl font-black text-primary font-mono">
                  {formatBDT(price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs sm:text-sm text-zinc-400 line-through font-mono">
                    {formatBDT(originalPrice!)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-2xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                    Save {formatBDT(originalPrice! - price)}
                  </span>
                )}
              </div>
            </div>

            {/* Order Item Context (if opened from an order in queue) */}
            {orderItemContext && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1">
                <span className="text-2xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-amber-700" />
                  Order Dispatch Details
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-zinc-500 text-2xs block">Ordered Size:</span>
                    <strong className="text-zinc-900 font-mono">
                      {orderItemContext.selectedSize || 'Standard'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-2xs block">Ordered Qty:</span>
                    <strong className="text-zinc-900 font-mono">
                      {orderItemContext.quantity || 1} units
                    </strong>
                  </div>
                  {orderItemContext.selectedColor && (
                    <div className="col-span-2 flex items-center gap-1.5 pt-0.5">
                      <span className="text-zinc-500 text-2xs">Ordered Color:</span>
                      <span 
                        className="w-3 h-3 rounded-full border border-zinc-300 inline-block shrink-0" 
                        style={{ backgroundColor: orderItemContext.selectedColor.hex || '#000000' }} 
                      />
                      <strong className="text-zinc-800 text-2xs">
                        {orderItemContext.selectedColor.name}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sizes & Colors */}
            <div className="space-y-3 pt-1">
              {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div>
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1 mb-1.5">
                    <Ruler className="w-3 h-3 text-zinc-400" />
                    Available Sizes:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {product.sizes.map((s, idx) => {
                      const isOrderedSize = orderItemContext?.selectedSize?.toLowerCase() === s.toLowerCase();
                      return (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                            isOrderedSize
                              ? 'bg-primary text-white border-primary shadow-2xs ring-2 ring-primary/20'
                              : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                          }`}
                        >
                          {s} {isOrderedSize ? '✓' : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {Array.isArray(product.colors) && product.colors.length > 0 && (
                <div>
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1 mb-1.5">
                    <Palette className="w-3 h-3 text-zinc-400" />
                    Available Colors:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colors.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-2xs font-medium text-zinc-700"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-zinc-300 shrink-0"
                          style={{ backgroundColor: c.hex || '#000000' }}
                        />
                        <span>{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description & Details */}
            {product.description && (
              <div className="pt-2 border-t border-zinc-200">
                <span className="text-2xs font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                  Product Description
                </span>
                <p className="text-xs text-zinc-700 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                  {product.description}
                </p>
              </div>
            )}

            {Array.isArray(product.details) && product.details.length > 0 && (
              <div className="pt-2 border-t border-zinc-200">
                <span className="text-2xs font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                  Highlights & Specifications
                </span>
                <ul className="text-xs text-zinc-600 space-y-1 list-disc list-inside">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="leading-snug">{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-zinc-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
