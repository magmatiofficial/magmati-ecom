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
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest font-sans">
            {'100% SECURE PAYMENT GATEWAYS'}
          </h4>
        </div>
        <p className="text-xs text-zinc-500 mb-3 leading-relaxed font-sans">
          {'Instant secure checkout via bKash Merchant, Nagad, Rocket, VISA, Mastercard & Nationwide Cash on Delivery.'}
        </p>

        {/* Payment Partner Badges */}
        <div className="flex flex-wrap gap-1.5 text-xs font-bold font-sans">
          <span className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-lg shadow-2xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            bKash
          </span>
          <span className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-lg shadow-2xs">
            Nagad
          </span>
          <span className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-lg shadow-2xs">
            Rocket
          </span>
          <span className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-lg shadow-2xs">
            VISA
          </span>
          <span className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-lg shadow-2xs">
            Mastercard
          </span>
          <span className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-lg shadow-2xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {'Cash on Delivery'}
          </span>
        </div>
      </div>

      {/* Express Delivery Partners */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2.5">
          <Truck className="w-3.5 h-3.5 text-zinc-500" />
          <h5 className="text-xs uppercase tracking-wider text-zinc-600 font-bold font-sans">
            {'EXPRESS DELIVERY PARTNERS'}
          </h5>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 font-sans">
          <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-600 hover:border-zinc-300 transition-colors">
            Steadfast Express
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-600 hover:border-zinc-300 transition-colors">
            Pathao Courier
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-600 hover:border-zinc-300 transition-colors">
            RedX Logistics
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-600 hover:border-zinc-300 transition-colors">
            Paperfly
          </span>
        </div>
      </div>
    </div>
  );
};
