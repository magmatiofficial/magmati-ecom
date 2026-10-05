'use client';

import React from 'react';
import { Zap, Truck, ShieldCheck, RotateCcw } from 'lucide-react';

interface DealsAssuranceStripProps {
  language?: string;
}

export const DealsAssuranceStrip: React.FC<DealsAssuranceStripProps> = ({ language }) => {
  return (
    <section className="bg-white border-t border-zinc-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">
                {'Hourly Flash Drops'}
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                {'New batch of flash deals unlocked every slot.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">
                {'Cash on Delivery'}
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                {'Inspect package at doorstep before making payment.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">
                {'Authentic Guaranteed'}
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                {'Directly from verified manufacturers & brand hubs.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">
                {'Easy 7-Day Return'}
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                {'No hassle returns or exchange on defects.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
