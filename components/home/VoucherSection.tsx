'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Check, ArrowRight } from 'lucide-react';
import { useVoucherStore, Voucher } from '@/store/useVoucherStore';
import { VoucherTicketCard } from '@/components/ui/VoucherTicketCard';

export function VoucherSection() {
  const { vouchers, claimVoucher, isVoucherClaimed } = useVoucherStore();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Take top 6 active vouchers
  const activeVouchers = (vouchers || []).filter((v) => v.isActive).slice(0, 6);

  const handleClaim = (v: Voucher) => {
    const result = claimVoucher(v.code);
    const msg = (result as any).messageEn || result.message;
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);

    // Copy coupon code to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(v.code).catch(() => {});
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6">
      {/* Elevated, ultra-clean Voucher Container */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white text-zinc-900 p-3.5 sm:p-6 lg:p-7 border border-zinc-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Top Brand Crimson Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-hover to-primary rounded-t-2xl sm:rounded-t-3xl" />

        {/* Section Header: Optimized for both Mobile & Desktop */}
        <div className="relative z-10 mb-4 sm:mb-5 pb-3 border-b border-zinc-100">
          {/* Top Row: Badge on Left, Action on Right */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Ticket className="w-3.5 h-3.5" />
              <span className="text-2xs sm:text-xs font-black uppercase tracking-wider">
                {'EXCLUSIVE VOUCHERS'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {toastMsg && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-2xs animate-in fade-in flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{toastMsg}</span>
                </span>
              )}
              <Link
                href="/cart"
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-primary text-zinc-700 hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs"
              >
                <span>{'Apply at Checkout'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Heading */}
          <div className="mt-2 sm:mt-2.5">
            <h2 className="text-base sm:text-xl lg:text-2xl font-black text-zinc-900 tracking-tight leading-tight">
              {'Collect Your Exclusive Vouchers'}
            </h2>
          </div>
        </div>

        {/* Modern 2-Column Mobile Grid for Authentic Scalloped Voucher Tickets */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {activeVouchers.map((voucher) => (
            <VoucherTicketCard
              key={voucher.id}
              voucher={voucher}
              mode="customer"
              
              isClaimed={isVoucherClaimed(voucher.code)}
              onClaim={handleClaim}
              notchBgClass="bg-white"
            />
          ))}
        </div>

      </div>
    </section>
  );
}
