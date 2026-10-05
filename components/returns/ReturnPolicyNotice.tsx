'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { formatBDT } from '@/lib/formatCurrency';
import {
  INSIDE_DHAKA_DELIVERY_FEE_BDT,
  OUTSIDE_DHAKA_DELIVERY_FEE_BDT,
} from '@/lib/constants';

export function ReturnPolicyNotice() {
  const insideFee = formatBDT(INSIDE_DHAKA_DELIVERY_FEE_BDT);
  const outsideFee = formatBDT(OUTSIDE_DHAKA_DELIVERY_FEE_BDT);

  return (
    <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-xs sm:text-sm text-zinc-800 shadow-3xs">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h4 className="font-bold text-amber-950 text-sm sm:text-base">
            {'রিটার্ন ও শিপিং চার্জ নীতিমালা'}
          </h4>
          <ol className="space-y-1.5 list-none text-zinc-700 font-medium leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-900 shrink-0">{'১.'}</span>
              <span>{'\"মত বদলেছে\" কারণে রিটার্ন করলে ডেলিভারি চার্জ রিফান্ড থেকে সঙ্গে সঙ্গে কেটে নেওয়া হবে।'}</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-900 shrink-0">{'২.'}</span>
              <span>{'অন্য কোনো কারণে (ভুল পণ্য, ত্রুটিপূর্ণ পণ্য ইত্যাদি) রিটার্ন করলে এখনই ডেলিভারি চার্জ কাটা হবে না।'}</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-900 shrink-0">{'৩.'}</span>
              <span>{'পণ্য হাতে পেয়ে আমাদের টিম যাচাই করবে। সত্যিই সমস্যা পাওয়া গেলে ডেলিভারি চার্জ আমরা বহন করব, আপনার রিফান্ড থেকে কিছু কাটা হবে না।'}</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-900 shrink-0">{'৪.'}</span>
              <span>{'যাচাইয়ে কোনো সমস্যা না পাওয়া গেলে ডেলিভারি চার্জ রিফান্ড থেকে কেটে নেওয়া হবে।'}</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-amber-900 shrink-0">{'৫.'}</span>
              <span>{`ফ্রি শিপিংয়ের অর্ডারেও রিটার্নে ডেলিভারি চার্জ প্রযোজ্য। ঢাকা সিটিতে ${insideFee} এবং ঢাকার বাইরে ${outsideFee}।`}</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default ReturnPolicyNotice;
