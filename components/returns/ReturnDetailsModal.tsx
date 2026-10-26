'use client';

/**
 * @file components/returns/ReturnDetailsModal.tsx
 * @description Return request details modal (status, milestones, items, price breakdown, evidence photos) with the full-screen photo lightbox.
 */
import React, { useState } from 'react';
import Image from 'next/image';
import { RotateCcw, Package, ZoomIn, X, Truck } from 'lucide-react';
import type { ReturnRequest } from '@/store/useReturnStore';
import { formatBDT } from '@/lib/formatCurrency';
import { getItemUnitPrice, getItemLineTotal } from '@/lib/itemPrice';
import { getReturnItemName, getReturnItemImage } from '@/lib/returns/returnItemDisplay';
import { getReturnShippingDisplay } from '@/lib/returns/returnShippingDisplay';

interface ReturnDetailsModalProps {
  matchedReturn: ReturnRequest | null;
  setMatchedReturn: (value: ReturnRequest | null) => void;
}

export function ReturnDetailsModal({ matchedReturn, setMatchedReturn }: ReturnDetailsModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <>
            {/* Audit & Details Modal Popup when user clicks 'View Status' on any return row */}
            {matchedReturn && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
                <div className="bg-white rounded-3xl w-full max-w-2xl border border-zinc-200 shadow-2xl max-h-[92dvh] overflow-y-auto flex flex-col animate-scale-up">
                  {/* Modal Header */}
                  <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-primary" />
                      <div>
                        <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block">
                          {'RETURN REQUEST AUDIT & MILESTONES'}
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold font-mono text-zinc-950 flex items-center gap-1.5">
                          {matchedReturn.id}
                          <span className="text-xs text-zinc-400 font-sans">({matchedReturn.status})</span>
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMatchedReturn(null)}
                      className="w-8 h-8 rounded-full hover:bg-zinc-200/80 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body - Full status, milestones, photos, payment details */}
                  <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Status Banner */}
                    <div className={`rounded-2xl p-4 border ${
                      matchedReturn.status === 'Completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : matchedReturn.status === 'Rejected'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : matchedReturn.status === 'Approved'
                        ? 'bg-sky-50 border-sky-200 text-sky-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50">
                        <span className="text-xs font-bold uppercase tracking-wider">{'Current Progress:'}</span>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-white shadow-3xs">
                          {matchedReturn.status}
                        </span>
                      </div>
                      <p className="text-xs mt-2 leading-relaxed font-medium">
                        {matchedReturn.status === 'Pending' && 'Your request is pending review by our support team. We will contact you shortly.'}
                        {matchedReturn.status === 'Approved' && 'Great news! Your return has been authorized. Courier pickup has been scheduled.'}
                        {matchedReturn.status === 'Completed' && 'Return completed and refund money disbursed successfully.'}
                        {matchedReturn.status === 'Rejected' && 'Return request was declined as per warranty terms.'}
                      </p>
                      {matchedReturn.adminNotes && (
                        <div className="mt-3 pt-2 border-t border-zinc-200/60 text-xs">
                          <strong className="block text-2xs uppercase tracking-wider font-extrabold opacity-70">
                            {'Disbursement Note:'}
                          </strong>
                          <span>{matchedReturn.adminNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Returned Items List */}
                    <div className="space-y-2">
                      <span className="text-2xs font-extrabold uppercase text-zinc-400 tracking-wider block">
                        {'RETURNED PRODUCTS:'}
                      </span>
                      <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100 bg-zinc-50/50 px-4">
                        {matchedReturn.items?.map((item, idx) => {
                          const itemName = getReturnItemName(item) || 'Returned Product';
                          const itemImage = getReturnItemImage(item);
                          return (
                            <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-3">
                                {itemImage ? (
                                  <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-zinc-200 bg-white shrink-0 shadow-2xs">
                                    <Image
                                      src={itemImage}
                                      alt={itemName}
                                      fill
                                      sizes="44px"
                                      className="object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-11 h-11 rounded-xl border border-zinc-200 bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-400">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-zinc-900 block truncate max-w-[240px]">
                                    {itemName}
                                  </span>
                                  <div className="flex items-center gap-2 text-2xs text-zinc-500 mt-0.5">
                                    {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                                    {item.selectedColor && (
                                      <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full inline-block border border-zinc-200" style={{ backgroundColor: item.selectedColor.hex }} />
                                        {item.selectedColor.name}
                                      </span>
                                    )}
                                    <span>Qty: <strong>{item.quantity}</strong></span>
                                    <span>Unit: <strong>{formatBDT(getItemUnitPrice(item))}</strong></span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right font-mono font-bold text-zinc-800">
                                {formatBDT(getItemLineTotal(item))}
                              </div>
                            </div>
                          );
                        })}

                        {/* Price Breakdown */}
                        {(() => {
                          const details = getReturnShippingDisplay(matchedReturn);

                          return (
                            <div className="py-3.5 space-y-2 border-t border-zinc-200 text-xs font-sans">
                              <div className="flex items-center justify-between text-zinc-700 font-bold">
                                <span>{'1. Returned Products Price Subtotal:'}</span>
                                <span className="font-mono text-zinc-900 text-sm font-bold">{formatBDT(details.subtotal)}</span>
                              </div>

                              {details.type === 'rejected' ? null : details.type === 'applied' ? (
                                <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 space-y-1">
                                  <div className="flex items-center justify-between text-amber-900 font-bold">
                                    <span className="flex items-center gap-1.5">
                                      <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                                      <span>{'2. Return Courier Shipping Charge:'}</span>
                                    </span>
                                    <span className="font-mono font-bold text-amber-900">{`- ${formatBDT(details.deduction)}`}</span>
                                  </div>
                                  <p className="text-2xs leading-tight text-amber-800 font-medium">
                                    {details.note}
                                  </p>
                                </div>
                              ) : details.type === 'waived' ? (
                                <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 space-y-1">
                                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                                    <span className="flex items-center gap-1.5">
                                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span>{'2. Return Courier Shipping Charge:'}</span>
                                    </span>
                                    <span className="font-mono font-bold text-emerald-900">{'৳0'}</span>
                                  </div>
                                  <p className="text-2xs leading-tight text-emerald-700 font-medium">
                                    {details.note}
                                  </p>
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-xl border border-zinc-200 bg-white space-y-1">
                                  <div className="flex items-center justify-between text-zinc-700 font-bold">
                                    <span className="flex items-center gap-1.5">
                                      <Truck className="w-4 h-4 text-zinc-400 shrink-0" />
                                      <span>{'2. Return Courier Shipping Charge:'}</span>
                                    </span>
                                    <span className="font-mono font-bold text-zinc-900">{'৳0'}</span>
                                  </div>
                                  <p className="text-2xs leading-tight text-zinc-500 italic font-medium">
                                    {details.note}
                                  </p>
                                </div>
                              )}

                              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between font-black text-sm sm:text-base text-zinc-950">
                                <span>{'3. Net Refund You Will Receive:'}</span>
                                <span className="font-mono text-emerald-600 font-black text-base sm:text-lg">{formatBDT(details.netRefund)}</span>
                              </div>

                              {matchedReturn.status === 'Rejected' && (
                                <p className="text-xs text-rose-600 font-medium pt-1">
                                  {'রিটার্ন বাতিল করা হয়েছে, কোনো রিফান্ড নেই'}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Evidence photos preview with Lightbox zoom */}
                    {matchedReturn.images && matchedReturn.images.length > 0 && (
                      <div className="space-y-2 bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                        <span className="text-2xs font-extrabold uppercase text-zinc-400 tracking-wider block">
                          {'EVIDENCE PHOTOS (CLICK TO ZOOM):'}
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {matchedReturn.images.map((url, index) => (
                            <button
                              type="button"
                              key={index}
                              onClick={() => setPreviewImage(url)}
                              className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 bg-white hover:opacity-90 transition-opacity cursor-pointer group shadow-2xs"
                              title="Click to view full screen"
                            >
                              <Image
                                src={url}
                                alt="Return evidence upload"
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-5 h-5 drop-shadow-sm" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Refund Wallet details */}
                    <div className="bg-zinc-50/80 border border-zinc-200 rounded-2xl p-4 space-y-1 text-xs">
                      <span className="text-2xs font-extrabold text-zinc-400 uppercase tracking-widest block">
                        {'REFUND PAYMENT ACCOUNT:'}
                      </span>
                      <strong className="text-zinc-900 font-mono font-bold block">{matchedReturn.paymentDetails}</strong>
                      <span className="text-2xs text-zinc-500 block">Method: {matchedReturn.paymentMethod}</span>
                    </div>

                  </div>
                </div>
              </div>
            )}

      {/* Lightbox Full Screen Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90dvh] w-full flex flex-col items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white/10 hover:bg-white/20 rounded-full px-3.5 py-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
            <div className="relative w-full h-[75dvh] max-h-[750px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-zinc-950 flex items-center justify-center">
              <Image
                src={previewImage}
                alt="Evidence Full Preview"
                fill
                className="object-contain"
                unoptimized
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
