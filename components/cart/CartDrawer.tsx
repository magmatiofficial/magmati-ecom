/**
 * @file components/cart/CartDrawer.tsx
 * @description Slide-in shopping bag drawer with free delivery progress bar,
 * item selection checkboxes, live subtotal computation for selected items,
 * and quick proceed to checkout.
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, ArrowRight, CheckSquare, Square } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { formatBDT } from '@/lib/formatCurrency';
import { FREE_SHIPPING_THRESHOLD_BDT } from '@/lib/constants';
import { CartItemRow } from './CartItemRow';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const router = useRouter();
  const { 
    isCartOpen, 
    closeCart, 
    items, 
    updateQuantity, 
    removeItem, 
    toggleItemSelection,
    selectAllItems,
  } = useCartStore();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const itemsList = React.useMemo(() => (mounted ? items : []), [mounted, items]);
  const selectedItems = React.useMemo(() => itemsList.filter((item) => item.selected !== false), [itemsList]);
  const subtotal = React.useMemo(() => selectedItems.reduce((total, item) => {
    const price = typeof item.customPrice === 'number' ? item.customPrice : item.product.price;
    return total + price * item.quantity;
  }, 0), [selectedItems]);
  const selectedCount = React.useMemo(() => selectedItems.reduce((total, item) => total + item.quantity, 0), [selectedItems]);
  const totalItemsCount = React.useMemo(() => itemsList.reduce((total, item) => total + item.quantity, 0), [itemsList]);

  const isAllSelected = itemsList.length > 0 && itemsList.every((item) => item.selected !== false);

  const { freeShippingThreshold = FREE_SHIPPING_THRESHOLD_BDT } = useSiteSettingsStore();

  const remainingForFreeDelivery = Math.max(0, freeShippingThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleCheckoutClick = () => {
    if (selectedCount === 0) return;
    closeCart();
    router.push('/cart');
  };

  const handleToggleSelectAll = () => {
    selectAllItems(!isAllSelected);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`pure-drawer-backdrop ${isCartOpen ? 'is-open' : ''}`}
        onClick={closeCart}
        aria-hidden={!isCartOpen}
      />

      {/* Drawer Panel */}
      <aside
        className={`pure-drawer-panel drawer-right flex flex-col ${
          isCartOpen ? 'is-open' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-token/90 bg-surface">
          <div className="flex items-center gap-2 font-sans">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-sans font-bold text-base sm:text-lg text-app-text">
              {'Shopping Bag'}
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-950 text-white font-sans">
              {totalItemsCount}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 text-app-muted hover:text-primary rounded-full hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-zinc-950 text-white border-b border-zinc-800 px-5 py-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 mb-1.5">
            <span>
              {remainingForFreeDelivery === 0
                ? ('🎉 You unlocked FREE Nationwide Delivery!')
                : `Add ${formatBDT(remainingForFreeDelivery)} more for FREE Shipping`}
            </span>
            <span className="text-emerald-400 font-mono font-bold">{freeDeliveryProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>

        {/* Select All Bar (when items > 0) */}
        {itemsList.length > 0 && (
          <div className="px-5 py-2.5 bg-zinc-100/80 border-b border-zinc-200 flex items-center justify-between text-xs font-semibold text-zinc-800">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 text-zinc-900 font-bold hover:text-primary transition-colors cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-primary fill-primary/10" />
              ) : (
                <Square className="w-4 h-4 text-zinc-400" />
              )}
              <span>
                {'Select All'} ({itemsList.length})
              </span>
            </button>
            <span className="text-zinc-500 font-mono text-xs">
              {selectedCount} {'Selected'}
            </span>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-border-subtle custom-scrollbar-thin bg-surface">
          {itemsList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center text-app-muted mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-sans font-bold text-app-text text-base mb-1">
                {'Your Shopping Bag is Empty'}
              </h3>
              <p className="text-xs text-app-muted max-w-xs mb-6 leading-relaxed">
                {'Explore our latest festive arrivals and premium collections.'}
              </p>
              <Button
                variant="primary"
                onClick={closeCart}
                className="rounded-full cursor-pointer"
              >
                {'Explore Collections'}
              </Button>
            </div>
          ) : (
            (itemsList || []).map((item) => (
              <CartItemRow
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.hex}${item.isFreeItem ? '-free' : ''}${item.isComboItem ? `-combo-${item.comboId || ''}` : ''}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                onToggleSelect={toggleItemSelection}
                onCloseDrawer={closeCart}
              />
            ))
          )}
        </div>

        {/* Footer Subtotal & Checkout CTA */}
        {itemsList.length > 0 && (
          <div className="p-5 border-t border-border-token bg-surface-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-app-muted uppercase tracking-wider block">
                  {'Subtotal'}
                </span>
                <span className="text-2xs text-zinc-500 font-medium">
                  {selectedCount} {'selected items'}
                </span>
              </div>
              <span className="font-mono text-lg font-bold text-app-text">
                {formatBDT(subtotal)}
              </span>
            </div>

            <p className="text-eyebrow text-app-muted/80">
              {'Delivery charges & coupons calculated at checkout step.'}
            </p>

            <Button
              variant="primary"
              onClick={handleCheckoutClick}
              disabled={selectedCount === 0}
              className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {selectedCount === 0 
                  ? ('Select Items to Checkout')
                  : `Proceed to Checkout (${selectedCount})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
