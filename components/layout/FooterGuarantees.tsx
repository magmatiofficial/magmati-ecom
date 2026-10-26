'use client';

import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Banknote } from 'lucide-react';

interface FooterGuaranteesProps {
  
}

export const FooterGuarantees: React.FC<FooterGuaranteesProps> = () => {
  const guarantees = [
    {
      icon: Truck,
      color: 'text-zinc-700',
      bg: 'bg-zinc-100 border-zinc-200',
      titleEn: 'Nationwide Delivery',
      descEn: 'Doorstep shipping across all 64 districts',
    },
    {
      icon: Banknote,
      color: 'text-zinc-700',
      bg: 'bg-zinc-100 border-zinc-200',
      titleEn: 'Cash on Delivery',
      descEn: 'Check product & pay at your doorstep',
    },
    {
      icon: RotateCcw,
      color: 'text-zinc-700',
      bg: 'bg-zinc-100 border-zinc-200',
      titleEn: '7-Day Easy Return',
      descEn: 'Hassle-free replacement guarantee',
    },
    {
      icon: ShieldCheck,
      color: 'text-zinc-700',
      bg: 'bg-zinc-100 border-zinc-200',
      titleEn: '100% Genuine Warranty',
      descEn: 'Official verified brand products only',
    },
  ];

  return (
    <div className="border-b border-zinc-200 py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 lg:gap-4">
        {guarantees.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              className="flex items-center gap-2 sm:gap-3.5 p-2 sm:p-3.5 lg:p-4 rounded-xl sm:rounded-2xl bg-white border border-zinc-100 shadow-2xs hover:shadow-xs transition-all duration-200"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl ${item.bg} ${item.color} border flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-eyebrow sm:text-xs lg:text-sm font-bold text-zinc-900 leading-tight font-sans truncate">
                  {item.titleEn}
                </h4>
                <p className="text-2xs sm:text-eyebrow text-zinc-500 mt-0.5 leading-tight font-sans line-clamp-1">
                  {item.descEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
