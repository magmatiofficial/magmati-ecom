'use client';

import React from 'react';
import { Check, Sparkles, Edit, Trash2, DollarSign, Tag, ShieldCheck, User as UserIcon, Copy, ArrowRight, Clock } from 'lucide-react';
import { Voucher, useVoucherStore } from '@/store/useVoucherStore';
import { voucherNeedsAccount } from '@/lib/voucherStatus';

export interface TicketTheme {
  headerBg: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  valueColor: string;
  btnBg: string;
  btnHover: string;
  btnText: string;
}

export const TICKET_THEMES: Record<string, TicketTheme> = {
  MAGMA200: {
    headerBg: 'bg-primary-subtle',
    borderColor: 'border-primary/20 hover:border-primary/30',
    badgeBg: 'bg-white border border-primary/20',
    badgeText: 'text-primary font-semibold',
    valueColor: 'text-primary-dark',
    btnBg: 'bg-primary',
    btnHover: 'hover:bg-primary-hover',
    btnText: 'text-white',
  },
  FREESHIP: {
    headerBg: 'bg-emerald-100/70',
    borderColor: 'border-emerald-300/80 hover:border-emerald-400',
    badgeBg: 'bg-emerald-200/80 border border-emerald-300',
    badgeText: 'text-emerald-900 font-semibold',
    valueColor: 'text-emerald-900',
    btnBg: 'bg-primary',
    btnHover: 'hover:bg-primary-hover',
    btnText: 'text-white',
  },
  SUPER10: {
    headerBg: 'bg-emerald-100/70',
    borderColor: 'border-emerald-300/80 hover:border-emerald-400',
    badgeBg: 'bg-emerald-200/80 border border-emerald-300',
    badgeText: 'text-emerald-900 font-semibold',
    valueColor: 'text-emerald-900',
    btnBg: 'bg-primary',
    btnHover: 'hover:bg-primary-hover',
    btnText: 'text-white',
  },
  WELCOME100: {
    headerBg: 'bg-indigo-100/70',
    borderColor: 'border-indigo-300/80 hover:border-indigo-400',
    badgeBg: 'bg-indigo-200/80 border border-indigo-300',
    badgeText: 'text-indigo-900 font-semibold',
    valueColor: 'text-indigo-900',
    btnBg: 'bg-primary',
    btnHover: 'hover:bg-primary-hover',
    btnText: 'text-white',
  },
  BKASH10: {
    headerBg: 'bg-pink-100/70',
    borderColor: 'border-pink-300/80 hover:border-pink-400',
    badgeBg: 'bg-pink-200/80 border border-pink-300',
    badgeText: 'text-pink-900 font-semibold',
    valueColor: 'text-pink-900',
    btnBg: 'bg-primary',
    btnHover: 'hover:bg-primary-hover',
    btnText: 'text-white',
  },
  NAGAD10: {
    headerBg: 'bg-orange-100/70',
    borderColor: 'border-orange-300/80 hover:border-orange-400',
    badgeBg: 'bg-orange-200/80 border border-orange-300',
    badgeText: 'text-orange-900 font-semibold',
    valueColor: 'text-orange-900',
    btnBg: 'bg-primary',
    btnHover: 'hover:bg-primary-hover',
    btnText: 'text-white',
  },
};

export const DEFAULT_TICKET_THEME: TicketTheme = {
  headerBg: 'bg-primary-subtle',
  borderColor: 'border-zinc-200 hover:border-zinc-300',
  badgeBg: 'bg-white border border-primary/20',
  badgeText: 'text-primary font-semibold',
  valueColor: 'text-primary-dark',
  btnBg: 'bg-primary',
  btnHover: 'hover:bg-primary-hover',
  btnText: 'text-white',
};

export function getVoucherTicketTheme(voucher: Voucher): TicketTheme {
  const codeKey = voucher.code.toUpperCase();
  if (TICKET_THEMES[codeKey]) return TICKET_THEMES[codeKey];

  if (voucher.discountType === 'percentage') return TICKET_THEMES.SUPER10;
  if (voucher.discountType === 'free_shipping') return TICKET_THEMES.FREESHIP;
  if (voucher.code.toLowerCase().includes('bkash')) return TICKET_THEMES.BKASH10;
  if (voucher.code.toLowerCase().includes('nagad')) return TICKET_THEMES.NAGAD10;
  if (voucher.code.toLowerCase().includes('welcome')) return TICKET_THEMES.WELCOME100;

  return DEFAULT_TICKET_THEME;
}

export interface VoucherTicketCardProps {
  voucher: Voucher;
  mode?: 'customer' | 'admin' | 'cart';
  isClaimed?: boolean;
  status?: 'active' | 'used' | 'expired' | 'inactive';
  usageText?: string;
  onClaim?: (voucher: Voucher) => void;
  onEdit?: (voucher: Voucher) => void;
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
  notchBgClass?: string;
  onCopy?: (code: string) => void;
  onApply?: () => void;
  copiedCode?: string | null;
}

/**
 * Unified, authentic scalloped physical ticket card component
 * used across Home Page, Admin Panel, Cart, Checkout, and User Account.
 */
export function VoucherTicketCard({
  voucher,
  mode = 'customer',
  isClaimed = false,
  status = 'active',
  usageText,
  onClaim,
  onEdit,
  onToggleStatus,
  onDelete,
  notchBgClass = 'bg-white',
  onCopy,
  onApply,
  copiedCode,
}: VoucherTicketCardProps) {
  const usage = useVoucherStore((s) => s.voucherUsageTotals[voucher.id]);
  
  const theme = getVoucherTicketTheme(voucher);

  // Derive big discount display value
  let discountDisplay = '৳200';
  let discountUnit = 'FLAT OFF';
  if (voucher.discountType === 'percentage') {
    discountDisplay = `${voucher.discountValue}%`;
    discountUnit = 'CASHBACK';
  } else if (voucher.discountType === 'free_shipping') {
    discountDisplay = 'FREE';
    discountUnit = 'SHIPPING';
  } else {
    discountDisplay = `৳${voucher.discountValue}`;
    discountUnit = 'FLAT OFF';
  }

  return (
    <div
      className={`relative rounded-xl bg-white border ${theme.borderColor} shadow-xs flex flex-col overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
        status !== 'active'
          ? 'opacity-60 grayscale'
          : voucher.isActive
          ? ''
          : 'opacity-60 grayscale-[25%]'
      } ${mode === 'admin' ? 'min-h-[290px]' : 'min-h-[175px]'}`}
    >
      {/* 1. TOP TICKET STUB: Header, Badge, Code & Big Discount */}
      <div className={`relative ${theme.headerBg} p-2.5 pb-3.5 flex flex-col items-center justify-between text-center min-h-[90px] border-b border-zinc-200/60`}>
        {/* Badge & Code Row */}
        <div className="w-full flex flex-wrap items-start justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-2xs font-medium ${theme.badgeBg} ${theme.badgeText} shadow-xs leading-tight`}>
              {voucher.badge}
            </span>

            {status !== 'active' && (
              <span className="px-2 py-0.5 rounded-full text-2xs font-medium bg-zinc-200 text-zinc-700 border border-zinc-300 shadow-xs leading-tight">
                {status === 'used' ? 'USED UP' : status === 'expired' ? 'EXPIRED' : 'INACTIVE'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="font-mono text-2xs sm:text-2xs font-medium text-zinc-800 bg-white/80 px-2 py-0.5 rounded-full border border-zinc-200">
              {voucher.code}
            </span>

            {/* Admin Controls */}
            {mode === 'admin' && (
              <div className="flex items-center gap-1 ml-0.5">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(voucher)}
                    className="p-1 bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200 rounded transition-colors cursor-pointer"
                    title={'Edit Voucher'}
                  >
                    <Edit className="w-3 h-3 text-zinc-600" />
                  </button>
                )}

                {onToggleStatus && (
                  <button
                    type="button"
                    onClick={() => onToggleStatus(voucher.id)}
                    className={`px-1.5 py-0.5 rounded text-2xs font-bold transition-all cursor-pointer ${
                      voucher.isActive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}
                    title={voucher.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {voucher.isActive ? 'ON' : 'OFF'}
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(voucher.id)}
                    className="p-1 bg-white hover:bg-primary-subtle text-zinc-600 hover:text-primary border border-zinc-200 rounded transition-colors cursor-pointer"
                    title={'Delete'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Big Discount Value */}
        <div className="my-auto py-0.5">
          <span 
            className={`block text-2xl sm:text-3xl font-bold ${theme.valueColor} leading-tight drop-shadow-xs`}
            style={{ fontFamily: 'var(--font-inter), "Noto Sans Bengali", "Segoe UI", system-ui, sans-serif' }}
          >
            {discountDisplay}
          </span>
          <span className="block text-2xs font-medium leading-tight text-zinc-600 mt-0.5">
            {discountUnit}
          </span>
        </div>

        {/* Scalloped Semi-Circular Punch-Hole Cutouts (Left & Right) */}
        <div className={`absolute -left-2.5 -bottom-2.5 w-5 h-5 rounded-full ${notchBgClass} border border-zinc-200 z-20`} />
        <div className={`absolute -right-2.5 -bottom-2.5 w-5 h-5 rounded-full ${notchBgClass} border border-zinc-200 z-20`} />

        {/* Horizontal Perforated Dashed Tear Line */}
        <div className="absolute bottom-0 left-3 right-3 h-0 border-t border-dashed border-zinc-300 pointer-events-none" />
      </div>

      {/* 2. BOTTOM TICKET BODY: Voucher Details & Actions */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between pt-3.5 relative z-10">
        <div>
          <h3 className="text-xs font-semibold text-zinc-900 leading-snug line-clamp-1">
            {voucher.title}
          </h3>
          <p className="text-2xs text-zinc-500 font-medium mt-0.5 leading-snug line-clamp-2">
            {voucher.condition}
          </p>
          {usageText && (
            <p className="text-2xs text-zinc-600 font-medium mt-1 leading-snug">
              {usageText}
            </p>
          )}
        </div>

        {/* Admin Stats Section */}
        {mode === 'admin' && (
          <div className="space-y-1.5 my-2 pt-2 border-t border-zinc-100">
            <div className="flex flex-wrap gap-1">
              <span className={`px-1.5 py-0.5 rounded text-2xs font-bold ${
                voucherNeedsAccount(voucher)
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}>
                {voucherNeedsAccount(voucher) ? ('Login Required') : ('Public / Guest')}
              </span>

              {voucher.paymentMethodRequirement && voucher.paymentMethodRequirement !== 'all' && (
                <span className="px-1.5 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                  <DollarSign className="w-2.5 h-2.5 shrink-0" />
                  <span>{voucher.paymentMethodRequirement.toUpperCase()}</span>
                </span>
              )}

              {voucher.applicableCategory && voucher.applicableCategory !== 'All' && (
                <span className="px-1.5 py-0.5 rounded text-2xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-0.5">
                  <Tag className="w-2.5 h-2.5 shrink-0" />
                  <span>{voucher.applicableCategory}</span>
                </span>
              )}
            </div>

            <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-100 space-y-1 text-2xs text-zinc-600">
              <div className="flex items-center justify-between">
                <span>{'Min Spend:'}</span>
                <span className="font-bold text-zinc-900">৳{voucher.minSpend}</span>
              </div>

              {voucher.maxUsesPerCustomer && (
                <div className="flex items-center justify-between">
                  <span>{'Max Uses/User:'}</span>
                  <span className="font-bold text-zinc-900">{voucher.maxUsesPerCustomer} {'times'}</span>
                </div>
              )}

              {voucher.totalDiscountBudget && (
                <div className="flex items-center justify-between">
                  <span>{'Total Budget:'}</span>
                  <span className="font-bold text-emerald-700">৳{voucher.totalDiscountBudget}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 text-2xs text-emerald-800 bg-emerald-50 px-1 rounded">
                <span className="flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{'Budget Used:'}</span>
                </span>
                <span className="font-bold font-mono text-emerald-700">৳{usage?.usedDiscountBudget ?? voucher.usedDiscountBudget ?? 0}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 text-2xs text-emerald-800 bg-emerald-50 px-1 rounded">
                <span className="flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{'Orders Used:'}</span>
                </span>
                <span className="font-bold font-mono text-emerald-700">{usage?.totalOrders ?? 0}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2">
          {mode === 'admin' ? (
            <div className="flex items-center justify-between text-2xs sm:text-2xs text-zinc-500 font-medium mb-1 truncate">
              <span className="flex items-center gap-0.5 text-zinc-500">
                <UserIcon className="w-3 h-3" />
                <span>{voucher.claimedByUsers?.length || 0} claims</span>
              </span>
              <span>{'Exp:'} {voucher.expiresAt || '31 Dec 2026'}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1 text-2xs text-zinc-500 font-medium shrink-0 min-w-0">
                <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">Exp: {voucher.expiresAt || '31 Dec 2026'}</span>
              </span>

              {isClaimed ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onCopy && onCopy(voucher.code)}
                    className="py-1 px-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 text-2xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    {copiedCode === voucher.code ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-500" />
                        <span>{'Copy'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={status !== 'active'}
                    onClick={status !== 'active' ? undefined : onApply}
                    className={`py-1 px-2.5 rounded-full text-2xs font-semibold flex items-center justify-center gap-0.5 transition-all shadow-2xs shrink-0 ${
                      status !== 'active'
                        ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-60'
                        : 'bg-primary hover:bg-primary-hover text-white cursor-pointer'
                    }`}
                  >
                    <span>{'Apply'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={status !== 'active' || isClaimed}
                  onClick={status !== 'active' ? undefined : () => onClaim && onClaim(voucher)}
                  className={`w-auto px-3 sm:px-4 py-1.5 rounded-full text-2xs sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-2xs shrink-0 ${
                    status !== 'active'
                      ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-60'
                      : isClaimed
                      ? 'bg-zinc-100 text-zinc-500 border border-zinc-200 cursor-default'
                      : `${theme.btnBg} ${theme.btnHover} ${theme.btnText} cursor-pointer`
                  }`}
                >
                  {isClaimed ? (
                    <>
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>{'COLLECTED'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{'COLLECT'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
