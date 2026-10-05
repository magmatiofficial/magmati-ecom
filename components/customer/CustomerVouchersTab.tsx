'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, Sparkles, Check, Copy, ChevronRight, ArrowRight } from 'lucide-react';
import { Voucher } from '@/store/useVoucherStore';
import { VoucherTicketCard } from '@/components/ui/VoucherTicketCard';

interface CustomerVouchersTabProps {
  vouchers: Voucher[];
  userClaimedCodes: string[];
  
  copiedVoucherCode: string | null;
  setCopiedVoucherCode: (code: string | null) => void;
  claimVoucher: (code: string, email: string) => void;
  currentUserEmail: string;
}

export const CustomerVouchersTab: React.FC<CustomerVouchersTabProps> = ({
  vouchers = [],
  userClaimedCodes = [],
  copiedVoucherCode,
  setCopiedVoucherCode,
  claimVoucher,
  currentUserEmail,
}) => {
  const claimedVouchersList = vouchers.filter((v) =>
    userClaimedCodes.includes(v.code.toUpperCase())
  );

  const availableVouchersList = vouchers.filter(
    (v) => v.isActive && !userClaimedCodes.includes(v.code.toUpperCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 flex-wrap gap-2">
        <div>
          <h2 className="font-sans text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            {'My Saved Vouchers & Coupons'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary bg-red-50 border border-primary/20 px-3 py-1 rounded-xl">
            {userClaimedCodes.length} {'Saved'}
          </span>
        </div>
      </div>

      {/* Claimed Vouchers List */}
      {claimedVouchersList.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-zinc-200 p-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 mb-1">
            {'No Saved Vouchers Yet'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {'Explore the available store promotions below and collect them to your account.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {claimedVouchersList.map((v) => (
            <VoucherTicketCard
              key={v.id}
              voucher={v}
              mode="customer"
              isClaimed={true}
              copiedCode={copiedVoucherCode}
              onCopy={(code) => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(code);
                    setCopiedVoucherCode(code);
                    setTimeout(() => setCopiedVoucherCode(null), 2500);
                }
              }}
              onApply={() => window.location.href = '/cart'}
            />
          ))}
        </div>
      )}

      {/* Available Store Offers to Claim */}
      <div className="pt-6 border-t border-zinc-200">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
            {'Discover More Store Deals'}
          </h3>
        </div>

        {availableVouchersList.length === 0 ? (
          <p className="text-xs text-zinc-400">
            {'All available vouchers have been collected!'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableVouchersList.map((v) => (
                <VoucherTicketCard
                    key={v.id}
                    voucher={v}
                    mode="customer"
                    isClaimed={false}
                    onClaim={() => claimVoucher(v.code, currentUserEmail)}
                />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
