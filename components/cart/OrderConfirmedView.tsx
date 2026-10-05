'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  Clock, 
  Package, 
  ArrowRight,
  MessageCircle,
  Mail,
  PhoneCall,
  Bell
} from 'lucide-react';
import { Order } from '@/store/useOrderStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { InvoiceModal } from '@/components/invoice/InvoiceModal';
import { cleanWhatsAppNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface OrderConfirmedViewProps {
  confirmedOrder: Order;
  
  formatBDT: (amount: number, lang?: any) => string;
  handleCopy: (text: string, type: 'orderId' | 'phone') => void;
  isCopiedOrderId: boolean;
}

export const OrderConfirmedView: React.FC<OrderConfirmedViewProps> = ({
  confirmedOrder,
  formatBDT,
  handleCopy,
  isCopiedOrderId,
}) => {
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const whatsappNumber = useSiteSettingsStore((s) => s.whatsappNumber);
  const supportEmail = useSiteSettingsStore((s) => s.supportEmail);
  const supportPhone = useSiteSettingsStore((s) => s.supportPhone);

  const cleanWhatsappNumber = cleanWhatsAppNumber(whatsappNumber);

  const itemsListText = confirmedOrder.items
    .map((it) => `- ${it.product.name} (${it.selectedSize || 'Free Size'}) x ${it.quantity}`)
    .join('\n');

  const whatsappMessage = encodeURIComponent(
    `*Order Confirmation - MAGMATI*\n\n` +
    `Order ID: #${confirmedOrder.id}\n` +
    `Customer Name: ${confirmedOrder.userName}\n` +
    `Mobile Number: ${confirmedOrder.phone}\n` +
    `Delivery Address: ${confirmedOrder.address}, ${confirmedOrder.district || ''}\n` +
    `Payment Method: ${confirmedOrder.payment}\n` +
    `Grand Total: ৳${confirmedOrder.total}\n\n` +
    `Items:\n${itemsListText}\n\n` +
    `Please process my order. Thank you!`
  );

  const whatsappUrl = cleanWhatsappNumber
    ? `https://wa.me/${cleanWhatsappNumber}?text=${whatsappMessage}`
    : `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-app-bg py-10 sm:py-16 px-4 animate-fade-in">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-10 shadow-xl font-sans">
        
        {/* Header Banner */}
        <div className="text-center pb-6 border-b border-zinc-100">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold text-primary uppercase tracking-[0.25em]">
            {'MAGMATI ATELIER • ORDER CONFIRMED'}
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-text-main mt-1.5 mb-2">
            {'Thank You for Shopping with MAGMATI!'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed font-normal">
            Your order has been recorded securely in our system. Our delivery concierge will call you before dispatching your package.
          </p>
        </div>

        {/* Quick Order Header & Copy ID */}
        <div className="mt-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">
              {'Order ID:'}
            </span>
            <span className="font-mono font-bold text-text-main text-sm sm:text-base">
              #{confirmedOrder.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCopy(confirmedOrder.id, 'orderId')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:border-zinc-300 transition-colors shadow-2xs cursor-pointer active:scale-95 h-auto min-h-0 uppercase-none"
            >
              {isCopiedOrderId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span className="text-emerald-700">{'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{'Copy ID'}</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInvoiceOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:border-zinc-300 transition-colors shadow-2xs cursor-pointer active:scale-95 h-auto min-h-0 uppercase-none"
            >
              <Printer className="w-3.5 h-3.5 text-primary" />
              <span>{'Print Invoice'}</span>
            </Button>
          </div>
        </div>

        {/* Real-World Order Progress Timeline */}
        <div className="my-6 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 bg-white">
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {'Live Order Timeline'}
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center text-2xs sm:text-xs">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                ✓
              </div>
              <span className="font-bold text-emerald-800 mt-2">
                {'Placed'}
              </span>
              <span className="text-2xs text-zinc-400">
                {confirmedOrder.date}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs animate-pulse">
                2
              </div>
              <span className="font-bold text-amber-800 mt-2">
                {'Processing'}
              </span>
              <span className="text-2xs text-zinc-400">
                {'Underway'}
              </span>
            </div>
            <div className="flex flex-col items-center opacity-40">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold">
                3
              </div>
              <span className="font-medium text-zinc-600 mt-2">
                {'Shipped'}
              </span>
              <span className="text-2xs text-zinc-400">
                Steadfast / RedX
              </span>
            </div>
            <div className="flex flex-col items-center opacity-40">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold">
                4
              </div>
              <span className="font-medium text-zinc-600 mt-2">
                {'Delivered'}
              </span>
              <span className="text-2xs text-zinc-400">
                {confirmedOrder.district}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Order Products */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            {'Purchased Garments'}
          </h4>
          <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-2xl overflow-hidden bg-white">
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center gap-3 text-xs">
                <div className="w-12 h-14 rounded-lg overflow-hidden bg-zinc-100 shrink-0 relative border border-zinc-200">
                  <Image
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=300&auto=format&fit=crop'}
                    alt={item.product.name}
                    fill
                    sizes="48px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-zinc-900 truncate">
                    {item.product.name}
                  </p>
                  <div className="flex items-center gap-2 text-eyebrow text-zinc-500 mt-0.5">
                    <span>{'Size:'} <strong>{item.selectedSize}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span 
                        className="w-2.5 h-2.5 rounded-full inline-block border border-zinc-300" 
                        style={{ backgroundColor: item.selectedColor.hex }}
                      />
                      {item.selectedColor.name}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-zinc-500 text-eyebrow">
                    {item.quantity} × {formatBDT(item.product.price)}
                  </div>
                  <div className="font-bold text-zinc-900 font-mono">
                    {formatBDT(item.product.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery & Financial Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Delivery Recipient Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-2xs text-zinc-400 block mb-1">
              {'Shipping Destination'}
            </span>
            <div>
              <strong className="text-zinc-900 text-sm block">{confirmedOrder.userName}</strong>
              <span className="text-zinc-600">{confirmedOrder.phone}</span>
            </div>
            <div className="text-zinc-600 pt-1 border-t border-zinc-200">
              <p>{confirmedOrder.address}</p>
              <p className="font-semibold text-zinc-800">{confirmedOrder.district}</p>
            </div>
            {confirmedOrder.orderNotes && (
              <div className="pt-1 text-eyebrow text-zinc-500 italic">
                Note: &quot;{confirmedOrder.orderNotes}&quot;
              </div>
            )}
          </div>

          {/* Payment & Charges Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-2xs text-zinc-400 block mb-1">
              {'Payment & Summary'}
            </span>
            <div className="flex justify-between">
              <span className="text-zinc-500">{'Payment:'}</span>
              <span className="font-bold text-zinc-900">{confirmedOrder.payment}</span>
            </div>
            {confirmedOrder.trxId && (
              <div className="flex justify-between text-eyebrow">
                <span className="text-zinc-500">TrxID:</span>
                <span className="font-mono font-bold text-emerald-700">{confirmedOrder.trxId}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-zinc-200">
              <span className="text-zinc-500">{'Subtotal:'}</span>
              <span className="font-semibold text-zinc-900 font-mono">
                {formatBDT(confirmedOrder.subtotal ?? confirmedOrder.total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">{'Delivery Fee:'}</span>
              <span className="font-semibold text-zinc-900 font-mono">
                {confirmedOrder.deliveryFee === 0 
                  ? ('FREE') 
                  : formatBDT(confirmedOrder.deliveryFee || 0)}
              </span>
            </div>
            {Boolean(confirmedOrder.discount && confirmedOrder.discount > 0) && (
              <div className="flex justify-between text-primary font-medium">
                <span>{'Discount:'}</span>
                <span>-{formatBDT(confirmedOrder.discount || 0)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-zinc-200 text-sm font-bold text-zinc-900">
              <span>{'Total Amount:'}</span>
              <span className="text-primary font-mono">{formatBDT(confirmedOrder.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer Notification & Support Assurance Card */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-emerald-950">
                {'Order Notification & Customer Dispatch'}
              </h5>
              <p className="text-emerald-800 text-xs mt-0.5 leading-relaxed">
                Your order #${confirmedOrder.id} has been recorded. Our team will verify delivery details via call or message before shipment.
              </p>
            </div>
          </div>
          {confirmedOrder.userEmail && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-mono shrink-0">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[150px]">{confirmedOrder.userEmail}</span>
            </div>
          )}
        </div>

        {/* WhatsApp Instant 1-Click Confirmation Button */}
        <div className="mb-5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all text-center shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white shrink-0" />
            <span>
              Send Order Summary / Confirm via WhatsApp
            </span>
          </a>
          <p className="text-xs text-zinc-500 text-center mt-1.5">
            💡 Have questions or need adjustments? Connect directly on WhatsApp.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/track?orderId=${confirmedOrder.id}`}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-all text-center shadow-xs active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="text-white font-bold">{'🚀 Track Live Status'}</span>
          </Link>

          <Link
            href="/shop"
            className="flex-1 py-3.5 px-5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-all text-center shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="text-white font-bold">{'Continue Shopping'}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>

      {/* Official Tax Invoice Modal */}
      <InvoiceModal
        order={confirmedOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        
      />
    </div>
  );
};
