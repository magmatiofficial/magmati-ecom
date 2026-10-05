'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  X, 
  Package, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard, 
  Truck, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Order } from '@/store/useOrderStore';
import { getItemUnitPrice, getItemLineTotal } from '@/lib/itemPrice';
import { OrderTrackingTimeline } from '../OrderTrackingTimeline';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { cleanWhatsAppNumber } from '@/lib/utils';

interface CustomerOrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  language?: string;
  formatBDT: (amount: number, lang?: any) => string;
}

export const CustomerOrderDetailsModal: React.FC<CustomerOrderDetailsModalProps> = ({
  order,
  onClose,
  language = 'en',
  formatBDT,
}) => {
  const whatsappNumber = useSiteSettingsStore((s) => s.whatsappNumber);

  if (!order) return null;

  const supportWhatsappText = encodeURIComponent(
    `Hello Magmati Lifestyle Support, I need assistance regarding my Order #${order.id}.`
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar print:p-0 print:bg-white print:static animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-zinc-200 my-auto max-h-[88dvh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar print:shadow-none print:border-none print:m-0 print:p-0">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-zinc-900">
                  {`Order Details #${order.id}`}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider border ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : order.status === 'Cancelled'
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-2xs sm:text-xs text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-400" />
                <span>{'Placed on:'} {order.date}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="space-y-5 pt-4 text-xs">
          
          {/* Order Tracking Progress Line */}
          <div className="bg-zinc-50/80 p-3 sm:p-4 rounded-2xl border border-zinc-200/90">
            <h4 className="font-bold text-zinc-900 text-xs mb-2 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-primary" />
              <span>{'Fulfillment & Delivery Progress'}</span>
            </h4>
            <OrderTrackingTimeline status={order.status}  />
          </div>

          {/* Customer Shipping & Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Delivery Address */}
            <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2">
              <h4 className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>{'Delivery Address'}</span>
              </h4>
              <p className="text-zinc-800 font-bold text-xs">{order.userName}</p>
              <p className="text-zinc-700 leading-relaxed text-2xs sm:text-xs">
                {order.address || ('Address not specified')}
              </p>
              {order.district && (
                <p className="text-zinc-500 text-2xs font-medium">
                  {'District:'} <span className="text-zinc-900 font-bold">{order.district}</span>
                </p>
              )}
              {order.phone && (
                <p className="text-zinc-700 text-2xs font-mono flex items-center gap-1 pt-1 border-t border-zinc-100">
                  <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>{order.phone}</span>
                </p>
              )}
            </div>

            {/* Payment & Order Summary Meta */}
            <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2">
              <h4 className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                <CreditCard className="w-4 h-4 text-primary shrink-0" />
                <span>{'Payment & Summary'}</span>
              </h4>
              <div className="space-y-1 text-2xs sm:text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">{'Payment Method:'}</span>
                  <span className="font-bold text-zinc-900 uppercase">{order.paymentMethod || order.payment || 'COD'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">{'Payment Status:'}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {order.status === 'Delivered' ? ('Paid') : ('Cash on Delivery')}
                  </span>
                </div>
                {order.orderNotes && (
                  <div className="mt-2 pt-2 border-t border-zinc-100 text-2xs text-zinc-500 italic">
                    {'Note:'} {order.orderNotes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Product List */}
          <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="px-4 py-2.5 bg-zinc-100 border-b border-zinc-200 font-bold text-zinc-800 text-xs flex items-center justify-between">
              <span>{'Ordered Products'}</span>
              <span className="text-2xs font-normal text-zinc-500">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
            </div>
            
            <div className="overflow-x-auto custom-table-scrollbar">
              <table className="w-full text-left text-xs min-w-[480px]">
                <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider text-2xs border-b border-zinc-200">
                  <tr>
                    <th className="py-2 px-3 sm:px-4">{'Product'}</th>
                    <th className="py-2 px-3 text-center">{'Size'}</th>
                    <th className="py-2 px-3 text-center">{'Qty'}</th>
                    <th className="py-2 px-3 sm:px-4 text-right">{'Price'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0">
                            {(item.product.image || item.product.images?.[0]) ? (
                              <Image
                                src={item.product.image || item.product.images?.[0] || ''}
                                alt={item.product?.name || 'Purchased order product thumbnail'}
                                fill
                                sizes="40px"
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 text-xs line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-2xs text-zinc-500">{formatBDT(getItemUnitPrice(item))} each</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-zinc-600 font-medium text-2xs">
                        {item.selectedSize || 'Standard'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-zinc-800">
                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded font-mono text-xs border border-zinc-200">
                          {item.quantity}x
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right font-bold text-zinc-900 text-xs">
                        {formatBDT(getItemLineTotal(item))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary Calculation */}
          <div className="flex justify-end pt-1">
            <div className="w-full sm:w-72 bg-zinc-50/90 p-4 rounded-2xl border border-zinc-200/90 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>{'Subtotal:'}</span>
                <span className="font-semibold text-zinc-800">
                  {formatBDT(order.subtotal || order.total - (order.shippingFee || 0) + (order.discountAmount || 0))}
                </span>
              </div>
              
              <div className="flex justify-between text-zinc-600">
                <span>{'Shipping Fee:'}</span>
                <span className="font-semibold text-zinc-800">
                  {formatBDT(order.shippingFee || 0)}
                </span>
              </div>

              {order.discountAmount ? (
                <div className="flex justify-between text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <span>{'Discount:'} ({order.appliedCoupon || 'Promo'})</span>
                  <span className="font-bold">-{formatBDT(order.discountAmount)}</span>
                </div>
              ) : null}

              <div className="border-t border-zinc-200 pt-2 flex justify-between font-extrabold text-sm text-zinc-900">
                <span>{'Grand Total:'}</span>
                <span className="text-primary">{formatBDT(order.total)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-5 border-t border-zinc-200 mt-6 print:hidden">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <a
              href={`https://wa.me/${cleanWhatsAppNumber(whatsappNumber)}?text=${supportWhatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>{'Order Support'}</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
          >
            {'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
