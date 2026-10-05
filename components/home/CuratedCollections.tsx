/**
 * @file components/home/CuratedCollections.tsx
 * @description Engaging E-Commerce Voucher Hub & Curated Shopping Zones Bento Showcase.
 * - Replaces clunky single-product card with 4 high-conversion curated department collections
 * - Integrated with useVoucherStore for persistent account-level voucher collection
 * - Official verified brand pavilion
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Ticket, 
  Check, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Tag,
  CreditCard,
  Truck,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useVoucherStore, Voucher } from '@/store/useVoucherStore';

export function CuratedCollections() {
  const { currentUser } = useAuthStore();
  const { vouchers, claimVoucher, isVoucherClaimed } = useVoucherStore();

  const [notification, setNotification] = useState<{ message: string; code: string } | null>(null);
  const [authPromptVoucher, setAuthPromptVoucher] = useState<Voucher | null>(null);

  const handleClaim = (v: Voucher) => {
    // If voucher requires login and user is not logged in, prompt authentication
    if (v.requiresLogin && !currentUser) {
      setAuthPromptVoucher(v);
      return;
    }

    const res = claimVoucher(v.id, currentUser?.email);
    
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(v.code).catch(() => {});
    }

    setNotification({
      message: (res as any).messageEn || res.message,
      code: v.code
    });

    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleCopyAndClosePrompt = (v: Voucher) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(v.code).catch(() => {});
    }
    setAuthPromptVoucher(null);
    setNotification({
      message: `Promo code "${v.code}" copied to clipboard!`,
      code: v.code
    });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      
      {/* Interactive Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-4 sm:right-8 z-50 bg-zinc-950/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-zinc-700 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold">{notification.message}</p>
            <p className="text-eyebrow text-zinc-400">
              {`Apply coupon ${notification.code} at checkout to get instant savings.`}
            </p>
          </div>
        </div>
      )}

      {/* Authentication Prompt Modal for Voucher Claim */}
      {authPromptVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-zinc-200 text-zinc-900 relative">
            <button
              type="button"
              onClick={() => setAuthPromptVoucher(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-subtle text-primary flex items-center justify-center font-bold">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xs font-black uppercase tracking-wider text-primary bg-primary-subtle px-2 py-0.5 rounded-full">
                  {'MEMBER EXCLUSIVE'}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-zinc-900 mt-0.5">
                  {authPromptVoucher.code} ({authPromptVoucher.titleEn})
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6 font-sans">
              {'To permanently collect this voucher into your account wallet and redeem it at checkout, please sign in or register your account.'}
            </p>

            <div className="space-y-2.5">
              <Link
                href="/account"
                onClick={() => setAuthPromptVoucher(null)}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-app-inverse rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>{'Sign In / Register Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => handleCopyAndClosePrompt(authPromptVoucher)}
                className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {'Just Copy Coupon Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. VOUCHER CLAIM CENTER */}
      <div className="bg-gradient-to-br from-zinc-900 via-neutral-900 to-zinc-950 rounded-3xl p-5 sm:p-7 md:p-8 text-white shadow-xl border border-zinc-800 relative overflow-hidden">
        {/* Glow Effects using performant radial gradient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(220,38,38,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-app-inverse text-2xs sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Ticket className="w-3.5 h-3.5" />
                  {'VOUCHER COLLECTION CENTER'}
                </span>
                <span className="text-eyebrow text-zinc-300 font-bold hidden sm:inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {'Auto-Saved to Account & Instant Redeem'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {'Collect Your Exclusive Vouchers'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {'Collect coupons now to enjoy instant price deductions at cart and checkout.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto">
              {currentUser ? (
                <Link
                  href="/account?tab=vouchers"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-zinc-300" />
                  <span>{'My Claimed Vouchers'}</span>
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors"
                >
                  <span>{'Sign In to Sync'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Vouchers Grid (2 Columns on Mobile, 4 Columns on Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {vouchers.filter((v) => v.isActive).map((v) => {
              const isClaimed = isVoucherClaimed(v.id, currentUser?.email);

              return (
                <div
                  key={v.id}
                  className={`group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-br ${
                    v.bgGradient || 'from-primary to-primary-dark'
                  } text-white shadow-md border border-white/20 hover:border-white/40 transition-all duration-200 overflow-hidden`}
                >
                  {/* Decorative Ticket Corner Notches */}
                  <div className="absolute top-1/2 -left-2 sm:-left-2.5 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-secondary border border-white/20 z-10" />
                  <div className="absolute top-1/2 -right-2 sm:-right-2.5 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-secondary border border-white/20 z-10" />

                  {/* Top Half: Ticket Value & Details */}
                  <div className="p-3 sm:p-5 pb-2 sm:pb-3">
                    {/* Badge & Code Row */}
                    <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2.5">
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 text-2xs sm:text-2xs font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md bg-black/40 text-amber-300 border border-amber-300/30 truncate max-w-[90px] sm:max-w-none">
                        <Sparkles className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{v.badgeEn}</span>
                      </span>
                      
                      <span className="font-mono text-2xs sm:text-eyebrow font-bold text-white bg-white/15 px-1.5 sm:px-2 py-0.5 rounded-md border border-dashed border-white/40 tracking-wider shrink-0">
                        {v.code}
                      </span>
                    </div>

                    {/* Voucher Discount Headline */}
                    <div className="my-1 sm:my-1.5">
                      <h4 className="text-sm sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-xs line-clamp-2">
                        {v.titleEn}
                      </h4>
                      <p className="text-2xs sm:text-xs text-white/90 mt-0.5 font-medium leading-tight line-clamp-1">
                        {v.conditionEn}
                      </p>
                    </div>

                    {/* Minimum spend tag */}
                    <div className="mt-1.5 sm:mt-2.5 flex items-center gap-1 text-2xs sm:text-2xs text-white/80 font-mono">
                      <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 shrink-0" />
                      <span className="truncate">{`Min: ৳${v.minSpend}`}</span>
                    </div>
                  </div>

                  {/* Perforated Tear Line with Semicircle Notch Alignment */}
                  <div className="relative w-full my-0.5 sm:my-1">
                    <div className="border-t border-dashed border-white/40 mx-2.5 sm:mx-4" />
                  </div>

                  {/* Bottom Half: Ticket Stub / Action Area */}
                  <div className="p-2.5 sm:p-5 pt-1.5 sm:pt-2 flex flex-col justify-end bg-black/15">
                    {/* Voucher Validity Expiry Date & Status */}
                    <div className="flex items-center justify-between text-2xs sm:text-eyebrow text-white font-medium mb-2 bg-black/30 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-white/10 gap-1">
                      <div className="flex items-center gap-1 text-white/95 min-w-0">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
                        <span className="font-sans text-2xs sm:text-eyebrow truncate">
                          {(v.expiresAtEn || '31 Dec 2026')}
                        </span>
                      </div>
                      <span className="font-mono text-2xs sm:text-2xs font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-white/20 text-white shrink-0">
                        {isClaimed ? ('SAVED') : ('ACTIVE')}
                      </span>
                    </div>

                    {/* Claim Button */}
                    <button
                      type="button"
                      onClick={() => handleClaim(v)}
                      className={`w-full py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl font-black text-2xs sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-all shadow-xs active:scale-95 cursor-pointer ${
                        isClaimed
                          ? 'bg-white text-zinc-900 shadow-white/20 hover:bg-zinc-100'
                          : 'bg-black/60 hover:bg-black text-white border border-white/30 hover:border-white/60'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>{'SAVED'}</span>
                        </>
                      ) : (
                        <>
                          <Ticket className="w-3.5 h-3.5 text-amber-300" />
                          <span>{'COLLECT'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

