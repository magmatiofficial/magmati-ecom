'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useVoucherStore, Voucher } from '@/store/useVoucherStore';
import { getVoucherStatus, voucherNeedsAccount } from '@/lib/voucherStatus';
import { VoucherTicketCard } from '@/components/ui/VoucherTicketCard';
import { toast } from '@/store/useToastStore';

export function VoucherSection() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { vouchers, claimVoucher, isVoucherClaimed, myVoucherUsage } = useVoucherStore();
  const [claimingCodes, setClaimingCodes] = useState<Record<string, boolean>>({});

  // Filter vouchers whose computed status is 'active', then take top 6
  const activeVouchers = (vouchers || [])
    .map((v) => ({ voucher: v, ...getVoucherStatus(v, myVoucherUsage) }))
    .filter((item) => item.status === 'active')
    .slice(0, 6);

  const handleClaim = async (v: Voucher) => {
    if (!currentUser && voucherNeedsAccount(v)) {
      toast.warning(`Voucher "${v.code}" needs an account. Please sign in to collect it.`);
      return;
    }
    if (claimingCodes[v.code]) return;
    setClaimingCodes((prev) => ({ ...prev, [v.code]: true }));
    try {
      const result = await claimVoucher(v.code, currentUser?.email);
      const msg = (result as any).messageEn || result.message;
      if (result.success) toast.success(msg); else toast.warning(msg);

      // Copy coupon code to clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(v.code).catch(() => {});
      }
    } finally {
      setClaimingCodes((prev) => ({ ...prev, [v.code]: false }));
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 font-sans">
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-border shadow-sm p-4 sm:p-6 lg:p-8">
        
        {/* Section Header: Match Daily/Budget Deals Pattern */}
        <div className="flex flex-nowrap items-center justify-between gap-3 mb-4 sm:mb-8 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-primary-subtle text-primary items-center justify-center shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-text-main leading-tight">
                {'Exclusive Vouchers'}
              </h2>
            </div>
          </div>

          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-2xs sm:text-xs font-bold text-text-main bg-surface hover:bg-surface-hover border border-border px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>{'Apply at Checkout'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Voucher Carousel: Horizontal scrolling with snap points */}
        <div className="relative z-10 flex flex-row flex-nowrap overflow-x-auto gap-3 pb-2 snap-x snap-mandatory no-scrollbar scroll-smooth">
          {activeVouchers.map(({ voucher, usageText }) => (
            <div
              key={voucher.id}
              className="shrink-0 snap-start w-[75%] min-w-[230px] sm:w-[280px] sm:min-w-0 lg:w-[calc((100%-2.25rem)/4)]"
            >
              <VoucherTicketCard
                voucher={voucher}
                mode="customer"
                usageText={usageText}
                isClaimed={isVoucherClaimed(voucher.code, currentUser?.email)}
                onClaim={handleClaim}
                notchBgClass="bg-surface"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
