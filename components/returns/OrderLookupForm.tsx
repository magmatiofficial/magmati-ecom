'use client';

/**
 * @file components/returns/OrderLookupForm.tsx
 * @description Step 1 of the return request: order ID and phone number lookup form.
 */
import React from 'react';
import { Search, Phone } from 'lucide-react';
import type { Order } from '@/store/useOrderStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { InlineAlert } from '@/components/ui/InlineAlert';

interface OrderLookupFormProps {
  orderIdInput: string;
  setOrderIdInput: (value: string) => void;
  phoneInput: string;
  setPhoneInput: (value: string) => void;
  matchedOrder: Order | null;
  lookupError: string | null;
  isLookingUp: boolean;
  successReturnId: string | null;
  handleOrderLookup: (e: React.FormEvent) => void | Promise<void>;
}

export function OrderLookupForm({ orderIdInput, setOrderIdInput, phoneInput, setPhoneInput, matchedOrder, lookupError, isLookingUp, successReturnId, handleOrderLookup }: OrderLookupFormProps) {
  return (
    <>
            {/* Step 1: Order Lookup form */}
            {!matchedOrder && !successReturnId && (
              <div className="bg-white rounded-3xl p-5 sm:p-8 border border-zinc-200 shadow-sm space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-900">
                    {'1. Verify Order Details'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {'Please verify your original Order ID and shipping mobile number to proceed.'}
                  </p>
                </div>

                <form onSubmit={handleOrderLookup} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 block mb-1">
                        {'Order ID:'}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        value={orderIdInput}
                        onChange={(e) => setOrderIdInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234567890"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white text-zinc-900 uppercase font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 block mb-1">
                        {'Mobile Phone:'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="017XXXXXXXX"
                        maxLength={15}
                        className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white text-zinc-900 font-bold font-mono"
                      />
                    </div>
                  </div>

                  {lookupError && <InlineAlert type="error">{lookupError}</InlineAlert>}

                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLookingUp ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>{'Verify Order'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
    </>
  );
}
