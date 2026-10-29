'use client';

import React from 'react';
import { Ticket, Sparkles } from 'lucide-react';
import { Voucher, useVoucherStore } from '@/store/useVoucherStore';
import { getVoucherStatus } from '@/lib/voucherStatus';
import { VoucherTicketCard } from '@/components/ui/VoucherTicketCard';
import { toast } from '@/store/useToastStore';

interface CustomerVouchersTabProps {
  vouchers: Voucher[];
  userClaimedCodes: string[];
  
  copiedVoucherCode: string | null;
  setCopiedVoucherCode: (code: string | null) => void;
  claimVoucher: (code: string, email: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
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
  const myVoucherUsage = useVoucherStore((s) => s.myVoucherUsage);
  const [claimingCodes, setClaimingCodes] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (currentUserEmail && currentUserEmail !== 'guest') {
      useVoucherStore.getState().refreshMyVoucherUsage();
      useVoucherStore.getState().loadMyClaims();
    }
  }, [currentUserEmail]);

  // visible: only vouchers returned by useVoucherStore.getState().getVisibleVouchers()
  const visibleVouchers = React.useMemo(() => {
    const visibleIds = new Set(useVoucherStore.getState().getVisibleVouchers().map((v) => v.id));
    return vouchers.filter((v) => visibleIds.has(v.id));
  }, [vouchers]);

  const claimedCodesSet = React.useMemo(
    () => new Set(userClaimedCodes.map((code) => code.toUpperCase())),
    [userClaimedCodes]
  );

  const processedVouchers = React.useMemo(() => {
    return visibleVouchers.map((v) => {
      const { status, usageText } = getVoucherStatus(v, myVoucherUsage);
      const isClaimed = claimedCodesSet.has(v.code.toUpperCase());
      const usedBefore = (myVoucherUsage[v.id]?.usedCount ?? 0) > 0;

      return {
        voucher: v,
        isClaimed,
        usedBefore,
        status,
        usageText,
      };
    });
  }, [visibleVouchers, claimedCodesSet, myVoucherUsage]);

  const activeClaimedVouchers = processedVouchers.filter(
    (item) => item.isClaimed && item.status === 'active'
  );

  const usedOrExpiredClaimedVouchers = processedVouchers.filter(
    (item) => item.status !== 'active' && (item.isClaimed || item.usedBefore)
  );

  const discoverVouchers = processedVouchers.filter(
    (item) => !item.isClaimed && item.status === 'active'
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
            {activeClaimedVouchers.length} {'Saved'}
          </span>
        </div>
      </div>

      {/* Claimed Vouchers List */}
      {activeClaimedVouchers.length === 0 ? (
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
          {activeClaimedVouchers.map((item) => (
            <VoucherTicketCard
              key={item.voucher.id}
              voucher={item.voucher}
              mode="customer"
              isClaimed={true}
              status={item.status}
              usageText={item.usageText}
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

      {/* Used & Expired Section (only when it has items) */}
      {usedOrExpiredClaimedVouchers.length > 0 && (
        <div className="pt-6 border-t border-zinc-200">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-zinc-400" />
              {'Used & Expired'}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {usedOrExpiredClaimedVouchers.map((item) => (
              <VoucherTicketCard
                key={item.voucher.id}
                voucher={item.voucher}
                mode="customer"
                isClaimed={true}
                status={item.status}
                usageText={item.usageText}
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

        {discoverVouchers.length === 0 ? (
          <p className="text-xs text-zinc-400">
            {'All available vouchers have been collected!'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoverVouchers.map((item) => (
                <VoucherTicketCard
                    key={item.voucher.id}
                    voucher={item.voucher}
                    mode="customer"
                    isClaimed={false}
                    status={item.status}
                    usageText={item.usageText}
                    onClaim={async () => {
                      const code = item.voucher.code;
                      if (claimingCodes[code]) return;
                      setClaimingCodes((prev) => ({ ...prev, [code]: true }));
                      try {
                        const res = await claimVoucher(code, currentUserEmail);
                        if (res) {
                          res.success ? toast.success(res.message) : toast.error(res.message);
                        }
                      } finally {
                        setClaimingCodes((prev) => ({ ...prev, [code]: false }));
                      }
                    }}
                />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
