'use client';

import React from 'react';
import { Ticket, AlertCircle, Sparkles, Tag, Check } from 'lucide-react';
import { Voucher } from '@/store/useVoucherStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CartCouponSectionProps {
  
  userClaimedCodes: string[];
  couponCode: string;
  setCouponCode: (code: string) => void;
  handleApplyCoupon: (e?: React.FormEvent, directCode?: string) => void;
  vouchers: Voucher[];
  couponMessage: string | null;
  isCouponSuccess: boolean;
  subtotal: number;
  appliedCouponCodes: string[];
}

export const CartCouponSection: React.FC<CartCouponSectionProps> = ({
  userClaimedCodes = [],
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  vouchers = [],
  couponMessage,
  isCouponSuccess,
  subtotal,
  appliedCouponCodes = [],
}) => {
  // Get all active vouchers in a single unified list to prevent confusing splits!
  const activeVouchers = vouchers.filter((v) => v.isActive);

  const renderCompactTicket = (v: Voucher) => {
    const isSelected = appliedCouponCodes.includes(v.code.toUpperCase());
    const isSaved = userClaimedCodes.includes(v.code.toUpperCase());
    const hasMinSpendIssue = subtotal < v.minSpend;

    // Brand matching ticket gradient for the left side accent
    const gradient = v.bgGradient || 'from-primary to-primary-dark';

    // Formatted discount value display
    let discVal = '৳২০০';
    let discUnit = 'OFF';
    if (v.discountType === 'percentage') {
      discVal = `${v.discountValue}%`;
      discUnit = 'CASHBACK';
    } else if (v.discountType === 'free_shipping') {
      discVal = 'FREE';
      discUnit = 'DELI';
    } else {
      discVal = `৳${v.discountValue}`;
      discUnit = 'FLAT OFF';
    }

    return (
      <button
        key={v.id}
        type="button"
        onClick={() => handleApplyCoupon(undefined, v.code)}
        className={`relative rounded-xl border flex items-stretch w-full overflow-hidden transition-all duration-200 text-left cursor-pointer h-16 ${
          isSelected
            ? 'border-primary ring-1 ring-primary/30 bg-red-50/15 shadow-[0_3px_10px_rgba(220,38,38,0.06)]'
            : 'border-border-color hover:border-border-hover hover:bg-surface-subtle/40 bg-white'
        }`}
      >
        {/* Left scalloped semi-circle ticket notches (clean light gray punch holes) */}
        <div className="absolute top-0 bottom-0 left-14 w-0 z-20 pointer-events-none">
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-surface-subtle border border-border-color rounded-full" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-surface-subtle border border-border-color rounded-full" />
        </div>

        {/* Left Coupon Tear-off portion (Soft elegant brand gradient) */}
        <div className={`w-14 shrink-0 bg-gradient-to-br ${gradient} text-white flex flex-col justify-center items-center text-center px-0.5 border-r border-dashed border-border-color/40`}>
          <span className="font-mono font-black text-xs sm:text-sm leading-none tracking-tight block">
            {discVal}
          </span>
          <span className="text-2xs font-black uppercase tracking-wider text-white/95 block mt-0.5 leading-none">
            {discUnit}
          </span>
        </div>

        {/* Right Details Panel (Soft, clean white/gray look) */}
        <div className="flex-1 p-2.5 flex flex-col justify-between min-w-0 pl-3">
          {/* Top Row: Promo Code & Saved/Selected Indicator */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono font-bold text-2xs text-text-main tracking-wider truncate bg-surface-subtle px-1.5 py-0.5 rounded border border-border-color uppercase">
                {v.code}
              </span>
              {isSaved && (
                <span className="text-2xs font-bold text-primary bg-red-50 border border-red-100 px-1 rounded">
                  {'Saved'}
                </span>
              )}
            </div>
            
            <div className="shrink-0 flex items-center justify-center">
              {isSelected ? (
                <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full border border-border-hover bg-white" />
              )}
            </div>
          </div>

          {/* Bottom Row: Brief text description & Min Spend Status chip */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-2xs font-bold text-text-muted truncate flex-1 leading-none">
              {v.title || (v as any).titleEn}
            </span>
            
            <span className={`text-2xs font-bold px-1.5 py-0.5 rounded leading-none shrink-0 ${
              hasMinSpendIssue 
                ? 'bg-amber-50 text-amber-800 border border-amber-200/70' 
                : 'bg-surface-subtle text-text-muted'
            }`}>
              {hasMinSpendIssue 
                ? (`Need ৳${v.minSpend - subtotal}`)
                : (`Min ৳${v.minSpend}`)}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-border-color/90 p-5 shadow-xs font-sans space-y-4">
      
      {/* Title Area */}
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          <h4 className="font-sans text-xs sm:text-sm font-bold text-text-main uppercase tracking-wide">
            {'Discount Vouchers & Coupons'}
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          {appliedCouponCodes.length > 0 && (
            <span className="text-2xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md uppercase">
              {appliedCouponCodes.length} {'Applied'}
            </span>
          )}
          {userClaimedCodes.length > 0 && (
            <span className="text-2xs font-bold text-primary bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
              {`${userClaimedCodes.length} Saved`}
            </span>
          )}
        </div>
      </div>

      {/* Manual Input Promo Form */}
      <form onSubmit={(e) => handleApplyCoupon(e)} className="flex items-end gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder={'Enter coupon code (e.g., FREESHIP)'}
            className="pl-8 uppercase font-sans font-bold"
          />
          <Tag className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-[15px]" />
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="h-11 px-5 uppercase tracking-wide font-sans shrink-0"
        >
          {'Apply'}
        </Button>
      </form>

      {/* Live Coupon Validation Message */}
      {couponMessage && (
        <div className={`text-2xs sm:text-xs font-medium font-sans px-3.5 py-2.5 rounded-xl border flex items-start gap-1.5 leading-relaxed ${
          isCouponSuccess 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-current" />
          <div className="flex-1">
            <span>{couponMessage}</span>
          </div>
        </div>
      )}

      {/* Unified Vouchers Grid (No confusing split!) */}
      <div className="space-y-2.5">
        <h5 className="text-2xs font-bold uppercase tracking-wider text-text-muted block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>{'AVAILABLE COUPONS (CLICK TO APPLY / COMBINE):'}</span>
        </h5>

        {activeVouchers.length === 0 ? (
          <div className="text-center py-5 bg-surface-subtle/50 rounded-2xl border border-dashed border-border-color text-text-subtle text-2xs font-bold uppercase tracking-wide">
            {'No coupons currently available'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
            {activeVouchers.map((v) => renderCompactTicket(v))}
          </div>
        )}
      </div>
    </div>
  );
};
