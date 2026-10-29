/**
 * @file components/cart/CartItemRow.tsx
 * @description Single cart item row with selection checkbox, quantity adjustment, size/color metadata, and remove button.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, Check } from 'lucide-react';
import { CartItem } from '@/types';
import { formatBDT } from '@/lib/formatCurrency';
import { getProductDisplayImage } from '@/lib/mediaUtils';
import { Button } from '@/components/ui/Button';

export interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, size: string, colorHex: string, quantity: number) => void;
  onRemove: (productId: string, size: string, colorHex: string) => void;
  onToggleSelect?: (productId: string, size: string, colorHex: string) => void;
  onCloseDrawer?: () => void;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  onToggleSelect,
  onCloseDrawer,
}: CartItemRowProps) {
  const displayImage = getProductDisplayImage(item.product);
  const isSelected = item.selected !== false;
  const priceToUse = typeof item.customPrice === 'number' ? item.customPrice : item.product.price;

  return (
    <div className={`py-4 flex gap-3 sm:gap-3.5 items-start transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-65 bg-zinc-50/50 rounded-xl px-2'}`}>
      {/* Checkbox for Item Selection */}
      {onToggleSelect && (
        <Button
          type="button"
          disabled={item.isFreeItem}
          onClick={() => onToggleSelect(item.product.id, item.selectedSize, item.selectedColor.hex)}
          variant="outline"
          size="icon"
          className={`mt-6 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-50 ${
            isSelected
              ? 'bg-primary border-primary text-white shadow-xs'
              : 'border-zinc-300 bg-white hover:border-zinc-400'
          }`}
          aria-label={isSelected ? 'Deselect item' : 'Select item'}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </Button>
      )}

      {/* Thumbnail */}
      <Link
        href={`/product/${item.product.id}`}
        onClick={onCloseDrawer}
        className="relative w-18 h-22 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-surface-subtle border border-border-token shrink-0"
      >
        <Image
          src={displayImage}
          alt={item.product.name}
          fill
          sizes="80px"
          referrerPolicy="no-referrer"
          className="object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <Link
              href={`/product/${item.product.id}`}
              onClick={onCloseDrawer}
              className={`text-xs sm:text-sm font-bold hover:text-primary transition-colors line-clamp-2 ${
                isSelected ? 'text-app-text' : 'text-zinc-500'
              }`}
            >
              {item.product.name}
            </Link>
            {item.isFreeItem && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-2xs font-extrabold uppercase">
                  🎁 FREE B1G1 GIFT
                </span>
                {item.promoLabel && (
                  <span className="inline-flex items-center text-2xs text-amber-700 italic font-medium">
                    ({item.promoLabel})
                  </span>
                )}
              </div>
            )}
            {item.isComboItem && (
              <>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-2xs font-extrabold uppercase">
                    📦 COMBO SAVINGS
                  </span>
                  {item.promoLabel && (
                    <span className="inline-flex items-center text-2xs text-rose-700 italic font-medium">
                      ({item.promoLabel})
                    </span>
                  )}
                </div>
                <p className="mt-1 text-2xs text-zinc-500">{'Bundle items are added and removed together'}</p>
              </>
            )}
          </div>
          <Button
            type="button"
            disabled={item.isFreeItem}
            onClick={() => onRemove(item.product.id, item.selectedSize, item.selectedColor.hex)}
            variant="ghost"
            size="icon"
            className="text-app-muted hover:text-primary transition-colors p-1 -mr-1 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-eyebrow text-app-muted mt-1 min-w-0">
          <span className="leading-tight shrink-0">{'Size'}: <b className="text-app-text">{item.selectedSize}</b></span>
          <span className="shrink-0">•</span>
          <div className="flex items-center gap-1 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full border border-border-token shrink-0"
              style={{ backgroundColor: item.selectedColor.hex }}
            />
            <span className="leading-tight min-w-0 break-words">{item.selectedColor.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-border-token rounded-lg bg-surface-subtle px-1 py-0.5">
            <Button
              type="button"
              disabled={item.isFreeItem || item.isComboItem}
              onClick={() =>
                onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor.hex, item.quantity - 1)
              }
              variant="ghost"
              size="sm"
              className="p-1 text-app-muted hover:text-app-text transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-6 text-center font-mono text-xs font-bold text-app-text">
              {item.quantity}
            </span>
            <Button
              type="button"
              disabled={item.isFreeItem || item.isComboItem}
              onClick={() =>
                onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor.hex, item.quantity + 1)
              }
              variant="ghost"
              size="sm"
              className="p-1 text-app-muted hover:text-app-text transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Line item subtotal */}
          <div className="flex flex-col items-end">
            {priceToUse === 0 ? (
              <span className="text-emerald-600 font-extrabold text-xs uppercase animate-pulse">
                {'FREE'}
              </span>
            ) : (
              <span className={`font-mono text-xs sm:text-sm font-bold ${isSelected ? 'text-app-text' : 'text-zinc-400'}`}>
                {formatBDT(priceToUse * item.quantity)}
              </span>
            )}
            {typeof item.customPrice === 'number' && item.product.price !== priceToUse && priceToUse > 0 && (
              <span className="text-2xs text-app-muted line-through font-mono">
                {formatBDT(item.product.price * item.quantity)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
