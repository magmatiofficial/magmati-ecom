'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Eye, ChevronRight, Printer, RotateCcw } from 'lucide-react';
import { Order, useOrderStore } from '@/store/useOrderStore';
import { getItemLineTotal } from '@/lib/itemPrice';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';
import { InvoiceModal } from '@/components/invoice/InvoiceModal';
import { CustomerOrderDetailsModal } from './modals/CustomerOrderDetailsModal';

interface CustomerOrdersTabProps {
  myOrders: Order[];
  
  formatBDT: (amount: number, lang?: any) => string;
  expandedUserOrderId: string | null;
  setExpandedUserOrderId: (id: string | null) => void;
}

export const CustomerOrdersTab: React.FC<CustomerOrdersTabProps> = ({
  myOrders,
    formatBDT,
  expandedUserOrderId,
  setExpandedUserOrderId,
}) => {
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  React.useEffect(() => {
    try {
      useOrderStore.getState().fetchOrderHistory();
    } catch (err) {
      console.warn('Error fetching order history on tab mount:', err);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-sans text-base sm:text-lg font-bold text-zinc-900">
            {'Recent Order History'}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {'Track and review all your placed orders and delivery status'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">{myOrders.length} {'orders'}</span>
        </div>
      </div>

      {myOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200/90 p-12 text-center shadow-xs font-sans">
          <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="font-sans text-base font-bold text-zinc-900 mb-1">
            {'No Orders Placed Yet'}
          </h3>
          <p className="text-xs text-zinc-500 mb-6">
            {'Add premium clothing and tech items to checkout!'}
          </p>
          <Link
            href="/shop"
            className="px-6 py-3 rounded-full bg-primary text-white text-xs font-medium uppercase tracking-wider hover:bg-primary-hover transition-colors inline-block"
          >
            {'Explore Collections'}
          </Link>
        </div>
      ) : (
        /* User Panel Orders Cards */
        <div className="space-y-4">
          {myOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-zinc-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-zinc-50 px-3 py-3 sm:px-5 sm:py-4 border-b border-zinc-200/90 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs font-sans">
                <div className="flex items-center gap-3">
                  <span className="font-sans font-bold text-text-main">#{order.id}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-600">{order.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-2xs font-bold tracking-wider uppercase font-sans border ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : order.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-amber-100 text-amber-900 border-amber-200'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="font-sans font-bold text-text-main text-sm">
                    {formatBDT(order.total)}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="p-4 sm:p-5">
                <div className="overflow-auto border-t border-l border-zinc-200 rounded-xl bg-white shadow-xs w-full">
                  <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[500px]">
                    <thead className="bg-zinc-100 text-zinc-600 uppercase tracking-wider text-2xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                      <tr>
                        <th className="px-4 py-3 border-b border-r border-zinc-200 bg-zinc-100">{'Product'}</th>
                        <th className="px-4 py-3 border-b border-r border-zinc-200 bg-zinc-100">{'Size'}</th>
                        <th className="px-4 py-3 border-b border-r border-zinc-200 bg-zinc-100 text-center">{'Qty'}</th>
                        <th className="px-4 py-3 border-b border-r border-zinc-200 bg-zinc-100 text-right">{'Price'}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/50 transition-colors group">
                          <td className="px-4 py-3 border-b border-r border-zinc-200">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0">
                                {(item.product.image || item.product.images?.[0]) ? (
                                  <Image
                                    src={item.product.image || item.product.images?.[0] || ''}
                                    alt={item.product?.name || 'Ordered product thumbnail'}
                                    fill
                                    sizes="48px"
                                    referrerPolicy="no-referrer"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-text-main group-hover:text-primary transition-colors truncate max-w-[150px] sm:max-w-[250px]">
                                {item.product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-r border-zinc-200 text-zinc-600 font-medium">{item.selectedSize}</td>
                          <td className="px-4 py-3 border-b border-r border-zinc-200 text-center font-bold text-zinc-700">
                            <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-eyebrow font-mono border border-zinc-200">
                              {item.quantity}x
                            </span>
                          </td>
                          <td className="px-4 py-3 border-b border-r border-zinc-200 text-right font-bold text-text-main">
                            {formatBDT(getItemLineTotal(item))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Progress / Status Timeline Tracking */}
              <OrderTrackingTimeline status={order.status}  />

              {/* Order Footer Actions */}
              <div className="px-5 py-3 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between text-xs font-sans flex-wrap gap-2">
                <span className="text-eyebrow text-zinc-500">
                  {'Payment:'} {order.payment}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {order.status === 'Delivered' && (
                    <Link
                      href={`/returns?orderId=${order.id}&phone=${order.phone}`}
                      className="px-2.5 py-1 bg-zinc-850 hover:bg-zinc-950 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                      title="Request Return / Refund"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-white" />
                      <span>{'Request Return'}</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedDetailOrder(order)}
                    className="px-2.5 py-1 bg-primary text-white hover:bg-primary-hover rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                    title="View Full Order Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{'Full Details'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="px-2.5 py-1 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                    title="View & Print Official Purchase Receipt / Invoice"
                  >
                    <Printer className="w-3.5 h-3.5 text-primary" />
                    <span>{'Print Invoice'}</span>
                  </button>
                  <Link
                    href="/shop"
                    className="font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1 text-eyebrow uppercase tracking-wider font-sans"
                  >
                    <span>{'Buy Again'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Full Order Details Modal */}
      <CustomerOrderDetailsModal
        order={selectedDetailOrder}
        onClose={() => setSelectedDetailOrder(null)}
        
        formatBDT={formatBDT}
      />

      {/* Official Invoice Modal for Customer */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        
      />
    </div>
  );
};
