'use client';

import React from 'react';
import { AlertCircle, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReturnPolicyNotice } from '@/components/returns/ReturnPolicyNotice';

interface CartPricingSummaryProps {
  
  subtotal: number;
  deliveryCharge: number;
  appliedDiscount: number;
  grandTotal: number;
  formatBDT: (amount: number, lang?: any) => string;
  formError: string | null;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  handleCompleteOrder: () => void;
  isSubmitting: boolean;
}

export const CartPricingSummary: React.FC<CartPricingSummaryProps> = ({
    subtotal,
  deliveryCharge,
  appliedDiscount,
  grandTotal,
  formatBDT,
  formError,
  paymentMethod,
  handleCompleteOrder,
  isSubmitting,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 p-5 sm:p-6 shadow-xs space-y-3 font-sans">
      <h3 className="font-sans text-sm font-bold text-text-main uppercase tracking-wider pb-2 border-b border-zinc-100">
        {'Order Summary'}
      </h3>

      <div className="space-y-2.5 text-xs font-sans">
        <div className="flex justify-between text-zinc-600">
          <span>{'Subtotal:'}</span>
          <span className="font-sans font-bold text-text-main">{formatBDT(subtotal)}</span>
        </div>

        <div className="flex justify-between text-zinc-600">
          <span>{'Delivery Fee:'}</span>
          <span className="font-sans font-bold text-text-main">
            {deliveryCharge === 0 ? (
              <span className="text-emerald-700 uppercase font-bold">FREE</span>
            ) : (
              formatBDT(deliveryCharge)
            )}
          </span>
        </div>

        {appliedDiscount > 0 && (
          <div className="flex justify-between text-primary font-semibold font-sans">
            <span>{'Coupon Discount:'}</span>
            <span className="font-sans font-bold">-{formatBDT(appliedDiscount)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline font-sans">
          <span className="font-sans text-sm font-bold text-text-main">
            {'Grand Total:'}
          </span>
          <span className="font-sans text-xl font-bold text-primary">
            {formatBDT(grandTotal)}
          </span>
        </div>
      </div>

      {/* Form Validation Error Message */}
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 text-primary rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Payment Guarantee Notice */}
      <div className="pt-2 text-eyebrow text-zinc-500 flex items-center gap-1.5 font-sans">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          {paymentMethod === 'cod'
            ? ('Cash on Delivery available nationwide in BDT (৳).')
            : ('100% encrypted and verified payment gateway.')}
        </span>
      </div>

      {/* Bengali Return Policy Notice */}
      <div className="mb-3">
        <ReturnPolicyNotice />
      </div>

      {/* Checkout Submit Button */}
      <Button
        variant="primary"
        onClick={handleCompleteOrder}
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 font-sans font-semibold text-xs cursor-pointer shadow-md bg-primary hover:bg-primary-hover text-white disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{'Processing Order...'}</span>
          </>
        ) : (
          <>
            <span>
              {paymentMethod === 'bkash'
                ? ('Confirm bKash Payment & Order')
                : paymentMethod === 'nagad'
                ? ('Confirm Nagad Payment & Order')
                : paymentMethod === 'card'
                ? ('Pay with Card & Confirm')
                : ('Place Order (Cash On Delivery)')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
};
