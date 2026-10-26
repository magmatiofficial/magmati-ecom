'use client';

/**
 * @file components/returns/ReturnSuccessScreen.tsx
 * @description Confirmation screen shown after a return request is submitted (return ID copy, track and shop actions).
 */
import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Check, Copy } from 'lucide-react';
import type { ReturnRequest } from '@/store/useReturnStore';

interface ReturnSuccessScreenProps {
  successReturnId: string | null;
  setActiveTab: (tab: 'request' | 'track') => void;
  setTrackSearchTerm: (value: string) => void;
  setMatchedReturn: (value: ReturnRequest | null) => void;
  copiedReturnId: boolean;
  returnRequests: ReturnRequest[];
  handleCopyReturnId: (id: string) => void;
}

export function ReturnSuccessScreen({ successReturnId, setActiveTab, setTrackSearchTerm, setMatchedReturn, copiedReturnId, returnRequests, handleCopyReturnId }: ReturnSuccessScreenProps) {
  return (
    <>
            {/* Success Screen */}
            {successReturnId && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-md text-center space-y-5 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 ring-4 ring-emerald-50">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                    {'Return Request Submitted Successfully!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                    {'Your return request has been submitted. Our support representative will contact you shortly to arrange pickup.'}
                  </p>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 max-w-sm mx-auto flex items-center justify-between gap-3">
                  <div className="text-left">
                    <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block">
                      {'Return Request ID:'}
                    </span>
                    <strong className="text-base sm:text-lg font-black font-mono text-zinc-900">
                      {successReturnId}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyReturnId(successReturnId)}
                    className="h-10 px-4 rounded-xl border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedReturnId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{'Copy'}</span>
                  </button>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (successReturnId) setTrackSearchTerm(successReturnId);
                      setActiveTab('track');
                      setTimeout(() => {
                        const found = returnRequests.find(r => r.id === successReturnId);
                        if (found) {
                          setMatchedReturn(found);
                        }
                      }, 100);
                    }}
                    className="w-full sm:w-auto px-6 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>{'Track Status'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    href="/"
                    className="w-full sm:w-auto px-6 h-12 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer"
                  >
                    {'Back to Shop'}
                  </Link>
                </div>
              </div>
            )}
    </>
  );
}
