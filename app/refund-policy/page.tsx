import React from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft } from 'lucide-react';

export default function Refund() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-zinc-200 shadow-xl p-6 sm:p-10 lg:p-12">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950">Refund & Return Policy</h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">Last updated: October 2026</p>
          </div>
        </div>
        <div className="space-y-6 text-sm text-zinc-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-zinc-950">1. Return Eligibility</h2>
            <p>You may request a return or exchange within 3 days of delivery for defective, damaged, or incorrect products.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-zinc-950">2. Refund Processing</h2>
            <p>Approved refunds are processed to your mobile wallet or bank account within 3-7 business days.</p>
          </section>
        </div>
      </div>
    </div>
  );
}