'use client';

/**
 * @file components/returns/ReturnRefundEstimate.tsx
 * @description Refund estimate breakdown box (selected items subtotal, return shipping deduction, net refund) for the return form.
 */
import React from 'react';
import { Truck } from 'lucide-react';
import type { Order } from '@/store/useOrderStore';
import { formatBDT } from '@/lib/formatCurrency';
import { getItemUnitPrice } from '@/lib/itemPrice';

interface ReturnRefundEstimateProps {
  returnReason: string;
  customReasonText: string;
  selectedItems: Record<string, { selected: boolean; quantity: number }>;
  matchedOrder: Order;
  getPotentialShippingFee: (order: any) => number;
}

export function ReturnRefundEstimate({ returnReason, customReasonText, selectedItems, matchedOrder, getPotentialShippingFee }: ReturnRefundEstimateProps) {
  return (
    <>
                  {/* Refund Estimate Breakdown Box */}
                  {(() => {
                    const currentReason = returnReason.includes('Other') ? customReasonText : returnReason;
                    const isMindChange = currentReason.toLowerCase().includes('mind') || currentReason.toLowerCase().includes('changed');
                    
                    const selectedItemsSubtotal = Object.keys(selectedItems)
                      .filter((k) => selectedItems[k]?.selected)
                      .reduce((sum, key) => {
                        const [productId, idxStr] = key.split('__');
                        const idx = parseInt(idxStr, 10);
                        const orderItem = matchedOrder.items[idx];
                        const selection = selectedItems[key];
                        if (!orderItem) return sum;
                        return sum + (getItemUnitPrice(orderItem) * selection.quantity);
                      }, 0);

                    if (selectedItemsSubtotal === 0) return null;

                    const potentialFee = getPotentialShippingFee(matchedOrder);
                    const deduction = isMindChange ? potentialFee : 0;
                    const netRefund = Math.max(0, selectedItemsSubtotal - deduction);

                    return (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                        <span className="text-2xs font-extrabold uppercase tracking-widest text-zinc-400 block">
                          {'REFUND ESTIMATE BREAKDOWN'}
                        </span>
                        <div className="space-y-2 text-xs text-zinc-700">
                          <div className="flex items-center justify-between font-bold text-zinc-800">
                            <span>{'Returned Products Value Subtotal:'}</span>
                            <span className="font-mono text-zinc-900 text-sm">{formatBDT(selectedItemsSubtotal)}</span>
                          </div>

                          {isMindChange ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 font-medium">
                              <span className="flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{'Return Courier Shipping Charge:'}</span>
                              </span>
                              <span className="font-mono font-bold text-amber-900">{`- ${formatBDT(deduction)}`}</span>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl border border-zinc-200 bg-white space-y-1.5">
                              <div className="flex items-center justify-between text-zinc-700 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Truck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                  <span>{'Return Courier Shipping Charge:'}</span>
                                </span>
                                <span className="font-mono font-bold text-zinc-900">{'৳0'}</span>
                              </div>
                              <p className="text-2xs leading-tight text-zinc-500 italic">
                                {'Pending Review: if our team finds no problem with the product, the delivery charge will be deducted.'}
                              </p>
                            </div>
                          )}

                          <div className="pt-2 border-t border-zinc-200 flex items-center justify-between font-extrabold text-zinc-950 text-sm sm:text-base">
                            <span>{'Net Refund You Will Receive:'}</span>
                            <span className="font-mono text-emerald-600 font-bold">{formatBDT(netRefund)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
    </>
  );
}
