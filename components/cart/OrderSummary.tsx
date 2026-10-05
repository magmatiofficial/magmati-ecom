/**
 * @file components/cart/OrderSummary.tsx
 * @description Order pricing breakdown panel with coupon voucher application, collected voucher quick selectors, and grand total.
 */

'use client';

import React from 'react';
import { Tag, ShieldCheck, Truck, Sparkles, Check } from 'lucide-react';
import { useVoucherStore } from '@/store/useVoucherStore';
import { formatBDT } from '@/lib/formatCurrency';
import { FREE_SHIPPING_THRESHOLD_BDT } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface OrderSummaryProps {
  subtotal: number;
  deliveryCharge: number;
  appliedDiscount: number;
  grandTotal: number;
  couponCode: string;
  onChangeCouponCode: (val: string) => void;
  onApplyCoupon: (e: React.FormEvent) => void;
  couponMessage: string | null;
  onProceedToCheckout?: () => void;
  isCheckoutPage?: boolean;
}

export function OrderSummary({
  subtotal,
  deliveryCharge,
  appliedDiscount,
  grandTotal,
  couponCode,
  onChangeCouponCode,
  onApplyCoupon,
  couponMessage,
  onProceedToCheckout,
  isCheckoutPage = false,
}: OrderSummaryProps) {
  const { vouchers, userClaimedCodes } = useVoucherStore();

  const handleSelectVoucher = (code: string) => {
    onChangeCouponCode(code);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      onApplyCoupon(fakeEvent);
    }, 50);
  };

  const activeVouchers = vouchers.filter((v) => v.isActive);

  return (
    <div className="bg-surface rounded-2xl border border-border-token/80 p-5 sm:p-6 space-y-5 font-sans">
      <h3 className="font-sans font-bold text-base sm:text-lg text-app-text pb-3 border-b border-border-subtle">
        {'Order Summary'}
      </h3>

      {/* Coupon Application Form */}
      <form onSubmit={onApplyCoupon} className="space-y-2.5">
        <label className="text-xs font-semibold text-app-text/80 uppercase tracking-wide block">
          {'Have a Promo Voucher?'}
        </label>
        
        <div className="flex gap-2">
          <Input
            type="text"
            value={couponCode}
            onChange={(e) => onChangeCouponCode(e.target.value)}
            placeholder="E.g. MAGMA200, FREESHIP"
            className="flex-1 px-3.5 py-2.5 bg-surface-subtle border border-border-token rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-hidden focus:border-primary text-app-text placeholder:text-app-muted/60 h-11"
          />
          <Button type="submit" variant="secondary" size="sm" className="rounded-xl px-4 cursor-pointer">
            {'Apply'}
          </Button>
        </div>

        {/* Quick Voucher Chips */}
        {activeVouchers.length > 0 && (
          <div className="pt-1">
            <div className="flex items-center gap-1 text-2xs font-bold text-app-muted uppercase mb-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>{'Available Vouchers'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeVouchers.map((v) => {
                const isSelected = couponCode.trim().toUpperCase() === v.code.toUpperCase();
                const isClaimed = userClaimedCodes.includes(v.code);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVoucher(v.code)}
                    className={`px-2 py-1 rounded-lg text-2xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white shadow-2xs'
                        : isClaimed
                        ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                        : 'bg-surface-subtle text-app-text hover:bg-border-subtle border border-border-token'
                    }`}
                  >
                    <span>{v.code}</span>
                    {isClaimed && <span className="text-2xs px-1 rounded bg-surface/20">Saved</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {couponMessage && (
          <p className="text-eyebrow font-medium text-emerald-600 flex items-center gap-1 mt-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
            <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{couponMessage}</span>
          </p>
        )}
      </form>

      {/* Pricing Lines */}
      <div className="space-y-2.5 text-xs sm:text-sm text-app-muted pt-3 border-t border-border-subtle">
        <div className="flex justify-between">
          <span>{'Subtotal'}</span>
          <span className="font-mono font-bold text-app-text">{formatBDT(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>{'Estimated Delivery'}</span>
          <span className="font-mono font-bold text-app-text">
            {deliveryCharge === 0 ? (
              <span className="text-emerald-600 font-bold uppercase text-xs">
                {'FREE'}
              </span>
            ) : (
              formatBDT(deliveryCharge)
            )}
          </span>
        </div>

        {appliedDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>{'Promo Discount'}</span>
            <span className="font-mono">-{formatBDT(appliedDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between pt-3 border-t border-border-token text-base sm:text-lg font-bold text-app-text">
          <span>{'Grand Total'}</span>
          <span className="font-mono text-primary">{formatBDT(grandTotal)}</span>
        </div>
      </div>

      {!isCheckoutPage && onProceedToCheckout && (
        <Button
          variant="primary"
          onClick={onProceedToCheckout}
          className="w-full py-3.5 rounded-xl shadow-md cursor-pointer"
        >
          {'Proceed to Checkout'}
        </Button>
      )}

      {/* Trust Badges */}
      <div className="pt-3 border-t border-border-subtle space-y-2 text-eyebrow text-app-muted">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-primary" />
          <span>
            {`Free Nationwide Delivery on orders over ৳${FREE_SHIPPING_THRESHOLD_BDT}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{'Cash on Delivery & 100% Authentic'}</span>
        </div>
      </div>
    </div>
  );
}
