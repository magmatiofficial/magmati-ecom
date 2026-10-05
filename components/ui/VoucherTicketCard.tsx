'use client';

import React from 'react';
import { Ticket, Check, Sparkles, Edit, Trash2, DollarSign, Tag, ShieldCheck, User as UserIcon, Copy, ArrowRight } from 'lucide-react';
import { Voucher } from '@/store/useVoucherStore';

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
    headerBg: 'bg-gradient-to-b from-primary-dark via-primary/50 to-zinc-900/90',
    borderColor: 'border-primary/40 hover:border-primary/60',
    badgeBg: 'bg-primary/20 border border-primary/35',
    badgeText: 'text-primary-subtle',
    valueColor: 'text-white',
    btnBg: 'bg-primary',
    btnHover: 'hover:bg-primary-hover',
    btnText: 'text-white',
  },
  FREESHIP: {
    headerBg: 'bg-gradient-to-b from-amber-950/90 via-amber-900/50 to-zinc-900/90',
    borderColor: 'border-amber-900/40 hover:border-amber-700/60',
    badgeBg: 'bg-amber-500/20 border border-amber-500/35',
    badgeText: 'text-amber-300',
    valueColor: 'text-amber-200',
    btnBg: 'bg-amber-600',
    btnHover: 'hover:bg-amber-500',
    btnText: 'text-white',
  },
  SUPER10: {
    headerBg: 'bg-gradient-to-b from-emerald-950/90 via-emerald-900/50 to-zinc-900/90',
    borderColor: 'border-emerald-900/40 hover:border-emerald-700/60',
    badgeBg: 'bg-emerald-500/20 border border-emerald-500/35',
    badgeText: 'text-emerald-300',
    valueColor: 'text-emerald-200',
    btnBg: 'bg-emerald-600',
    btnHover: 'hover:bg-emerald-500',
    btnText: 'text-white',
  },
  WELCOME100: {
    headerBg: 'bg-gradient-to-b from-indigo-950/90 via-indigo-900/50 to-zinc-900/90',
    borderColor: 'border-indigo-900/40 hover:border-indigo-700/60',
    badgeBg: 'bg-indigo-500/20 border border-indigo-500/35',
    badgeText: 'text-indigo-300',
    valueColor: 'text-indigo-200',
    btnBg: 'bg-indigo-600',
    btnHover: 'hover:bg-indigo-500',
    btnText: 'text-white',
  },
  BKASH10: {
    headerBg: 'bg-gradient-to-b from-pink-950/90 via-pink-900/50 to-zinc-900/90',
    borderColor: 'border-pink-900/40 hover:border-pink-700/60',
    badgeBg: 'bg-pink-500/20 border border-pink-500/35',
    badgeText: 'text-pink-300',
    valueColor: 'text-pink-200',
    btnBg: 'bg-pink-600',
    btnHover: 'hover:bg-pink-500',
    btnText: 'text-white',
  },
  NAGAD10: {
    headerBg: 'bg-gradient-to-b from-orange-950/90 via-orange-900/50 to-zinc-900/90',
    borderColor: 'border-orange-900/40 hover:border-orange-700/60',
    badgeBg: 'bg-orange-500/20 border border-orange-500/35',
    badgeText: 'text-orange-300',
    valueColor: 'text-orange-200',
    btnBg: 'bg-orange-600',
    btnHover: 'hover:bg-orange-500',
    btnText: 'text-white',
  },
};

export const DEFAULT_TICKET_THEME: TicketTheme = {
  headerBg: 'bg-gradient-to-b from-primary-dark via-primary/50 to-zinc-900/90',
  borderColor: 'border-primary/40 hover:border-primary/60',
  badgeBg: 'bg-primary/20 border border-primary/35',
  badgeText: 'text-primary-subtle',
  valueColor: 'text-white',
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
  onClaim,
  onEdit,
  onToggleStatus,
  onDelete,
  notchBgClass = 'bg-white',
  onCopy,
  onApply,
  copiedCode,
}: VoucherTicketCardProps) {
  
  const theme = getVoucherTicketTheme(voucher);

  // Derive big discount display value
  let discountDisplay = '\u09F3200';
  let discountUnit = 'FLAT OFF';
  if (voucher.discountType === 'percentage') {
    discountDisplay = `${voucher.discountValue}%`;
    discountUnit = 'CASHBACK';
  } else if (voucher.discountType === 'free_shipping') {
    discountDisplay = 'FREE';
    discountUnit = 'SHIPPING';
  } else {
    discountDisplay = `\u09F3${voucher.discountValue}`;
    discountUnit = 'FLAT OFF';
  }

  return (
    <div
      className={`relative rounded-2xl bg-zinc-900 border ${theme.borderColor} shadow-lg flex flex-col overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ${
        voucher.isActive ? '' : 'opacity-60 grayscale-[25%]'
      } ${mode === 'admin' ? 'min-h-[290px]' : 'min-h-[175px]'}`}
    >
      {/* 1. TOP TICKET STUB: Header, Badge, Code & Big Discount */}
      <div className={`relative ${theme.headerBg} p-2.5 pb-3.5 flex flex-col items-center justify-between text-center min-h-[78px] border-b border-white/10`}>
        {/* Badge & Code Row */}
        <div className="w-full flex items-center justify-between gap-1 mb-1">
          <span className={`px-2 py-0.5 rounded text-2xs font-black uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} shadow-xs truncate max-w-[55%]`}>
            {voucher.badge}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <span className="font-mono text-2xs sm:text-2xs font-black tracking-wider text-zinc-100 bg-black/60 px-1.5 py-0.5 rounded border border-white/15">
              {voucher.code}
            </span>

            {/* Admin Controls */}
            {mode === 'admin' && (
              <div className="flex items-center gap-1 ml-0.5">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(voucher)}
                    className="p-1 bg-black/50 hover:bg-white/20 text-white rounded transition-colors cursor-pointer"
                    title={'Edit Voucher'}
                  >
                    <Edit className="w-3 h-3 text-white" />
                  </button>
                )}

                {onToggleStatus && (
                  <button
                    type="button"
                    onClick={() => onToggleStatus(voucher.id)}
                    className={`px-1.5 py-0.5 rounded text-2xs font-bold transition-all cursor-pointer ${
                      voucher.isActive
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
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
                    className="p-1 bg-black/50 hover:bg-red-500/30 text-white hover:text-red-400 rounded transition-colors cursor-pointer"
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
            className={`block text-base sm:text-lg font-black ${theme.valueColor} tracking-tight leading-none drop-shadow-xs`}
            style={{ fontFamily: 'var(--font-inter), "Noto Sans Bengali", "Segoe UI", system-ui, sans-serif' }}
          >
            {discountDisplay}
          </span>
          <span className="block text-2xs font-black uppercase tracking-wider text-zinc-300/90 mt-0.5">
            {discountUnit}
          </span>
        </div>
      </div>

      {/* Scalloped Semi-Circular Punch-Hole Cutouts (Left & Right) */}
      <div className={`absolute -left-2.5 top-[70px] w-5 h-5 rounded-full ${notchBgClass} border border-zinc-300 z-20`} />
      <div className={`absolute -right-2.5 top-[70px] w-5 h-5 rounded-full ${notchBgClass} border border-zinc-300 z-20`} />

      {/* Horizontal Perforated Dashed Tear Line */}
      <div className="absolute top-[80px] left-3 right-3 h-0 border-t border-dashed border-white/25 z-10 pointer-events-none" />

      {/* 2. BOTTOM TICKET BODY: Voucher Details & Actions */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between pt-3 relative z-10">
        <div>
          <h3 className="text-xs font-bold text-white tracking-tight leading-snug line-clamp-1">
            {voucher.title}
          </h3>
          <p className="text-2xs text-zinc-400 font-medium truncate mt-0.5">
            {voucher.condition}
          </p>
        </div>

        {/* Admin Stats Section */}
        {mode === 'admin' && (
          <div className="space-y-1.5 my-2 pt-2 border-t border-zinc-800">
            <div className="flex flex-wrap gap-1">
              <span className={`px-1.5 py-0.5 rounded text-2xs font-bold ${
                voucher.requiresLogin
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                {voucher.requiresLogin ? ('Login Required') : ('Public / Guest')}
              </span>

              {voucher.paymentMethodRequirement && voucher.paymentMethodRequirement !== 'all' && (
                <span className="px-1.5 py-0.5 rounded text-2xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                  <DollarSign className="w-2.5 h-2.5 shrink-0" />
                  <span>{voucher.paymentMethodRequirement.toUpperCase()}</span>
                </span>
              )}

              {voucher.applicableCategory && voucher.applicableCategory !== 'All' && (
                <span className="px-1.5 py-0.5 rounded text-2xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-0.5">
                  <Tag className="w-2.5 h-2.5 shrink-0" />
                  <span>{voucher.applicableCategory}</span>
                </span>
              )}
            </div>

            <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800/80 space-y-1 text-2xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span>{'Min Spend:'}</span>
                <span className="font-bold text-white">৳{voucher.minSpend}</span>
              </div>

              {voucher.maxUsesPerCustomer && (
                <div className="flex items-center justify-between">
                  <span>{'Max Uses/User:'}</span>
                  <span className="font-bold text-white">{voucher.maxUsesPerCustomer} {'times'}</span>
                </div>
              )}

              {voucher.totalDiscountBudget && (
                <div className="flex items-center justify-between">
                  <span>{'Total Budget:'}</span>
                  <span className="font-bold text-emerald-400">৳{voucher.totalDiscountBudget}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-2xs text-emerald-300 bg-emerald-950/40 px-1 rounded">
                <span className="flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{'Budget Used:'}</span>
                </span>
                <span className="font-bold font-mono text-emerald-400">৳{voucher.usedDiscountBudget || 0}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2">
          <div className="flex items-center justify-between text-2xs sm:text-2xs text-zinc-400 font-medium mb-1 truncate">
            {mode === 'admin' ? (
              <>
                <span className="flex items-center gap-0.5 text-zinc-400">
                  <UserIcon className="w-3 h-3" />
                  <span>{voucher.claimedByUsers?.length || 0} claims</span>
                </span>
                <span>{'Exp:'} {voucher.expiresAt || '31 Dec 2026'}</span>
              </>
            ) : (
              <span className="w-full text-center">{'Exp:'} {voucher.expiresAt || '31 Dec 2026'}</span>
            )}
          </div>

          {mode !== 'admin' && (
            isClaimed ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onCopy && onCopy(voucher.code)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-2xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedCode === voucher.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>{'Copy Code'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onApply}
                  className="py-1.5 px-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-2xs font-black uppercase tracking-wider flex items-center justify-center gap-0.5 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <span>{'Apply'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onClaim && onClaim(voucher)}
                className={`w-full py-1.5 rounded-lg text-2xs sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm ${
                  isClaimed
                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-default'
                    : `${theme.btnBg} ${theme.btnHover} ${theme.btnText}`
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
            )
          )}
        </div>
      </div>
    </div>
  );
}
