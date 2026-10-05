'use client';

import React from 'react';
import { Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { INSIDE_DHAKA_DELIVERY_FEE_BDT, OUTSIDE_DHAKA_DELIVERY_FEE_BDT } from '@/lib/constants';

interface ProductGuaranteesProps {
  language?: string;
}

export const ProductGuarantees: React.FC<ProductGuaranteesProps> = ({ language }) => {
  return (
    <div className="p-4 rounded-2xl bg-surface-subtle border border-border-token/80 space-y-3 mb-8 font-sans">
      <div className="flex items-center gap-3 text-xs text-app-text/80">
        <Truck className="w-4 h-4 text-primary shrink-0" />
        <span>
          {`Nationwide Delivery in 2-3 Days (Inside Dhaka ৳${INSIDE_DHAKA_DELIVERY_FEE_BDT}, Outside ৳${OUTSIDE_DHAKA_DELIVERY_FEE_BDT})`}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-app-text/80">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
        <span>
          {'100% Genuine Verified Products & Official Warranty'}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-app-text/80">
        <RotateCcw className="w-4 h-4 text-primary shrink-0" />
        <span>
          {'7-Day Easy Replacement Policy nationwide'}
        </span>
      </div>
    </div>
  );
};
