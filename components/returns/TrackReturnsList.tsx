'use client';

/**
 * @file components/returns/TrackReturnsList.tsx
 * @description Customer returns history card: search box, empty state and returns table with the View Status action.
 */
import React from 'react';
import Image from 'next/image';
import { RotateCcw, Search, Package, ClipboardList, Eye } from 'lucide-react';
import type { ReturnRequest } from '@/store/useReturnStore';
import { formatBDT } from '@/lib/formatCurrency';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { getReturnItemName, getReturnItemImage } from '@/lib/returns/returnItemDisplay';
import { getReturnShippingDisplay } from '@/lib/returns/returnShippingDisplay';

interface TrackReturnsListProps {
  filteredReturnRequests: ReturnRequest[];
  trackSearchTerm: string;
  setTrackSearchTerm: (value: string) => void;
  setActiveTab: (tab: 'request' | 'track') => void;
  setMatchedReturn: (value: ReturnRequest | null) => void;
}

export function TrackReturnsList({ filteredReturnRequests, trackSearchTerm, setTrackSearchTerm, setActiveTab, setMatchedReturn }: TrackReturnsListProps) {
  return (
            <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-zinc-900">
                      {'Your Product Returns History'}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {'All returned items submitted on this device are automatically listed below.'}
                    </p>
                  </div>
                </div>

                {filteredReturnRequests.length > 0 && (
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={trackSearchTerm}
                      onChange={(e) => setTrackSearchTerm(e.target.value)}
                      placeholder="Search Return ID or Order ID..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white transition-all font-medium"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                )}
              </div>

              {filteredReturnRequests.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-200">
                    <RotateCcw className="w-7 h-7 text-zinc-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-zinc-900">
                      {'No Return Requests Found'}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      {'You have not submitted any product return applications yet.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('request')}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{'Submit New Return Request'}</span>
                  </button>
                </div>
              ) : (
                <ResponsiveTableContainer showScrollCues={true}>
                  <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[850px]">
                    <thead className="bg-zinc-100 text-zinc-700 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                      <tr>
                        <th className="px-4 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Return ID'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Order ID'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Returned Product'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Product Value'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Shipping Fee'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Net Refund'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Status'}</th>
                        <th className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-100 text-right">{'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
                      {filteredReturnRequests.map((req) => {
                        const details = getReturnShippingDisplay(req);
                        const firstItemName = getReturnItemName(req.items?.[0]) || 'Returned Product';
                        const firstItemImage = getReturnItemImage(req.items?.[0]);
                        const extraCount = (req.items?.length || 1) - 1;

                        return (
                          <tr key={req.id} className="hover:bg-zinc-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-mono">
                              <strong className="font-extrabold text-zinc-900 block">{req.id}</strong>
                              <span className="text-2xs text-zinc-400 font-sans block mt-0.5">
                                {new Date(req.createdAt).toLocaleDateString('en-US')}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 font-mono font-bold text-zinc-700">
                              #{req.orderId}
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                {firstItemImage ? (
                                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0 shadow-2xs">
                                    <Image
                                      src={firstItemImage}
                                      alt={firstItemName}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-xl border border-zinc-200 bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-400">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-zinc-900 block truncate max-w-[180px]" title={firstItemName}>
                                    {firstItemName}
                                    {extraCount > 0 && <span className="text-primary font-mono ml-1">+{extraCount} more</span>}
                                  </span>
                                  <span className="text-2xs text-zinc-400 block mt-0.5 font-medium">
                                    Reason: {req.reason}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Product Value */}
                            <td className="py-3.5 px-3 font-mono font-bold text-zinc-900">
                              {formatBDT(details.subtotal)}
                            </td>

                            {/* Shipping Fee */}
                            <td className="py-3.5 px-3 font-mono">
                              {details.deduction > 0 ? (
                                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                                  -{formatBDT(details.deduction)}
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 inline-block">
                                  ৳0
                                </span>
                              )}
                            </td>

                            {/* Net Refund */}
                            <td className="py-3.5 px-3 font-mono font-extrabold text-emerald-600 text-sm">
                              {formatBDT(details.netRefund)}
                            </td>

                            <td className="py-3.5 px-3">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider ${
                                req.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : req.status === 'Approved'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {req.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setMatchedReturn(req)}
                                className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-900 hover:text-white text-zinc-800 shadow-3xs cursor-pointer transition-all inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{'View Status'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ResponsiveTableContainer>
              )}
            </div>
  );
}
