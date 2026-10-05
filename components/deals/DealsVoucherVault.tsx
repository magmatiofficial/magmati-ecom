'use client';

import React from 'react';
import { Gift, Tag, Check, Copy } from 'lucide-react';

interface DealsVoucherVaultProps {
  
  coupons: Array<{
    code: string;
    title: string;
    desc: string;
    tag: string;
    discount: string;
    minSpend: string;
    color: string;
  }>;
  copiedCoupon: string | null;
  onCopy: (code: string) => void;
}

export const DealsVoucherVault: React.FC<DealsVoucherVaultProps> = ({
    coupons,
  copiedCoupon,
  onCopy,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            {'Instant Flash Coupons'}
          </h3>
        </div>
        <span className="text-xs text-zinc-500 font-medium">
          {'Apply during checkout'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {coupons.map((c) => (
          <div
            key={c.code}
            className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 relative overflow-hidden"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}>
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-2xs font-black px-1.5 py-0.5 bg-primary-subtle text-primary rounded border border-primary/20">
                    {c.tag}
                  </span>
                  <span className="text-xs font-bold text-zinc-900">{c.title}</span>
                </div>
                <p className="text-eyebrow text-zinc-500 leading-tight">{c.desc}</p>
              </div>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={() => onCopy(c.code)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-150 cursor-pointer active:scale-95 ${
                copiedCoupon === c.code
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-800'
              }`}
            >
              {copiedCoupon === c.code ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="font-sans text-eyebrow font-bold">Copied</span>
                </>
              ) : (
                <>
                  <span>{c.code}</span>
                  <Copy className="w-3.5 h-3.5 opacity-60" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
