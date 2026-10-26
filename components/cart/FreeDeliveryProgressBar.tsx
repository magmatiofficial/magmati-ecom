'use client';

import React from 'react';
import { Truck } from 'lucide-react';

interface FreeDeliveryProgressBarProps {
  remainingForFreeShipping: number;
  progressPercent: number;
  
  formatBDT: (amount: number, lang?: any) => string;
}

export const FreeDeliveryProgressBar: React.FC<FreeDeliveryProgressBarProps> = ({
  remainingForFreeShipping,
  progressPercent,
    formatBDT,
}) => {
  return (
    <div className="bg-secondary text-white rounded-2xl p-4 border border-zinc-800 shadow-sm font-sans">
      <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-400" />
          <span>
            {remainingForFreeShipping === 0
              ? 'Congratulations! You unlocked FREE nationwide delivery 🎉'
              : `Add ${formatBDT(remainingForFreeShipping)} more for FREE delivery`}
          </span>
        </div>
        <span className="text-eyebrow font-mono text-emerald-400">{Math.round(progressPercent)}%</span>
      </div>
      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
