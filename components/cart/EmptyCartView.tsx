'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface EmptyCartViewProps {
  
}

export const EmptyCartView: React.FC<EmptyCartViewProps> = () => {
  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 p-12 text-center max-w-lg mx-auto shadow-xs font-sans">
      <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-5 text-zinc-400">
        <ShoppingBag className="w-10 h-10 stroke-1" />
      </div>
      <h2 className="font-sans text-xl font-bold text-zinc-900 mb-2">
        {'Your Shopping Bag is Empty'}
      </h2>
      <p className="font-sans text-xs text-zinc-500 leading-relaxed mb-6 font-normal">
        {'Explore our latest festive arrivals, premium combed cotton panjabis, and artisan collections.'}
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-medium uppercase tracking-wider transition-colors shadow-sm font-sans"
      >
        <span>{'Explore Collections'}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
