'use client';

import React from 'react';
import { ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';

interface FooterPaymentPartnersProps {
  language?: string;
}

export const FooterPaymentPartners: React.FC<FooterPaymentPartnersProps> = ({ language }) => {
  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-black text-white uppercase tracking-widest font-sans">
            {'100% SECURE PAYMENT GATEWAYS'}
          </h4>
        </div>
        <p className="text-xs text-zinc-400 mb-3 leading-relaxed font-sans">
          {'Instant secure checkout via bKash Merchant, Nagad, Rocket, VISA, Mastercard & Nationwide Cash on Delivery.'}
        </p>

        {/* Payment Partner Badges */}
        <div className="flex flex-wrap gap-1.5 text-xs font-bold font-sans">
          <span className="px-2.5 py-1 bg-gradient-to-r from-pink-950 to-pink-900/80 text-pink-300 rounded-lg border border-pink-700/40 shadow-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            bKash
          </span>
          <span className="px-2.5 py-1 bg-gradient-to-r from-amber-950 to-amber-900/80 text-amber-300 rounded-lg border border-amber-700/40 shadow-xs">
            Nagad
          </span>
          <span className="px-2.5 py-1 bg-purple-950/80 text-purple-300 rounded-lg border border-purple-700/40 shadow-xs">
            Rocket
          </span>
          <span className="px-2.5 py-1 bg-blue-950/80 text-blue-300 rounded-lg border border-blue-700/40 shadow-xs">
            VISA
          </span>
          <span className="px-2.5 py-1 bg-red-950/80 text-red-300 rounded-lg border border-red-700/40 shadow-xs">
            Mastercard
          </span>
          <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 rounded-lg border border-emerald-700/40 shadow-xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {'Cash on Delivery'}
          </span>
        </div>
      </div>

      {/* Express Delivery Partners */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2.5">
          <Truck className="w-3.5 h-3.5 text-primary" />
          <h5 className="text-xs uppercase tracking-wider text-zinc-300 font-bold font-sans">
            {'EXPRESS DELIVERY PARTNERS'}
          </h5>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300 font-sans">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:border-zinc-700 transition-colors">
            Steadfast Express
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:border-zinc-700 transition-colors">
            Pathao Courier
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:border-zinc-700 transition-colors">
            RedX Logistics
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:border-zinc-700 transition-colors">
            Paperfly
          </span>
        </div>
      </div>
    </div>
  );
};
