'use client';

import React from 'react';
import Image from 'next/image';
import { X, Package, User, MapPin, Phone, Mail, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { Order } from '@/store/useOrderStore';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { cn } from '@/lib/utils';

interface AdminOrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  language?: string;
  formatBDT: (amount: number, lang?: any) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const AdminOrderDetailsModal: React.FC<AdminOrderDetailsModalProps> = ({
  order,
  onClose,
  formatBDT,
  updateOrderStatus,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[88dvh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar text-zinc-900 font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900">
                {`Order Details #${order.id}`}
              </h3>
              <p className="text-eyebrow text-zinc-500 mt-0.5">
                Placed on {order.date}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Body */}
        <div className="space-y-6 pt-4 text-xs font-sans">
          {/* Order Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80">
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block">Order ID</span>
              <span className="font-mono font-bold text-zinc-900 text-xs">#{order.id}</span>
            </div>
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block">Date Placed</span>
              <span className="font-medium text-zinc-800 text-xs flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-zinc-400" />
                {order.date}
              </span>
            </div>
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block">Payment</span>
              <span className="font-bold text-zinc-800 text-xs uppercase flex items-center gap-1 mt-0.5">
                <CreditCard className="w-3 h-3 text-emerald-600" />
                {(order.paymentMethod || order.payment || 'Cash on Delivery')}
              </span>
            </div>
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Status</span>
              <CustomDropdown
                value={order.status}
                onChange={(val) => updateOrderStatus(order.id, val as Order['status'])}
                options={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Processing', label: 'Processing' },
                  { value: 'Shipped', label: 'Shipped' },
                  { value: 'Delivered', label: 'Delivered' },
                  { value: 'Cancelled', label: 'Cancelled' },
                ]}
                triggerClassName={cn(
                  'h-8 text-2xs font-bold px-2 rounded-lg border-zinc-300',
                  order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800' :
                  order.status === 'Cancelled' ? 'bg-red-50 text-red-800' :
                  'bg-white text-zinc-800'
                )}
              />
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-zinc-200 space-y-2">
              <h4 className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Customer Information</span>
              </h4>
              <p className="text-zinc-800 font-semibold">{order.userName}</p>
              {order.userEmail && (
                <p className="text-zinc-600 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-zinc-400" />
                  <span>{order.userEmail}</span>
                </p>
              )}
              {order.phone && (
                <p className="text-zinc-600 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3 h-3 text-zinc-400" />
                  <span>{order.phone}</span>
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 space-y-2">
              <h4 className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Delivery Address</span>
              </h4>
              <p className="text-zinc-700 leading-relaxed">{order.address || 'Address not provided'}</p>
              {order.district && (
                <p className="text-zinc-500 font-medium">District: <span className="text-zinc-800 font-semibold">{order.district}</span></p>
              )}
              {order.orderNotes && (
                <div className="mt-2 pt-2 border-t border-zinc-100 text-2xs text-zinc-500 italic">
                  Note: {order.orderNotes}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Products */}
          <div className="border border-zinc-200 rounded-2xl overflow-x-auto custom-table-scrollbar">
            <table className="w-full text-left text-xs min-w-[480px]">
              <thead className="bg-zinc-50 text-zinc-500 font-bold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-4">Item</th>
                  <th className="py-2.5 px-4 text-center">Size</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(order.items || []).map((item, idx) => {
                  const resolvedImg = item.product?.images?.[0] || item.product?.image || (item as any)?.image;
                  const resolvedName = item.product?.name || (item as any)?.name || (item as any)?.title || 'Product Item';
                  const resolvedSku = item.product?.sku || (item as any)?.sku;
                  const unitPrice = typeof item.customPrice === 'number' 
                    ? item.customPrice 
                    : (item.product?.price || (item as any)?.price || 0);
                  const qty = item.quantity || 1;

                  return (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {resolvedImg && (
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                              <Image
                                src={resolvedImg}
                                alt={resolvedName}
                                fill
                                sizes="36px"
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-zinc-900 line-clamp-1">{resolvedName}</p>
                            <span className="text-2xs text-zinc-400 font-mono">SKU: {resolvedSku || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-600 font-medium">
                        {item.selectedSize || 'Standard'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-zinc-800">
                        {qty}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-600 font-medium">
                        {formatBDT(unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-zinc-900">
                        {formatBDT(unitPrice * qty)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              {(() => {
                const deliveryFee = order.deliveryFee ?? order.shippingFee ?? 0;
                const discountAmount = order.discount ?? order.discountAmount ?? 0;
                const subtotal = typeof order.subtotal === 'number'
                  ? order.subtotal
                  : Math.max(0, (order.total || 0) - deliveryFee + discountAmount);

                return (
                  <>
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{formatBDT(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Delivery Shipping:</span>
                      <span className="font-semibold">{deliveryFee > 0 ? formatBDT(deliveryFee) : 'FREE (৳0)'}</span>
                    </div>
                    {discountAmount > 0 ? (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount ({order.appliedCoupon || (order as any).couponCode || 'Voucher'}):</span>
                        <span>-{formatBDT(discountAmount)}</span>
                      </div>
                    ) : null}
                    <div className="border-t border-zinc-200 pt-2 flex justify-between font-bold text-sm text-zinc-900">
                      <span>Grand Total:</span>
                      <span className="text-primary">{formatBDT(order.total)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="flex justify-between items-center pt-5 border-t border-zinc-100 mt-6">
          <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Order #{order.id} verification & fulfillment</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
