'use client';

import React from 'react';
import { Banknote, Truck, Smartphone, CreditCard, Copy, Lock } from 'lucide-react';

interface CheckoutPaymentSelectorProps {
  
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  setPaymentMethod: (m: 'cod' | 'bkash' | 'nagad' | 'card') => void;
  officialPaymentNumber: string;
  handleCopy: (text: string, type: 'orderId' | 'phone') => void;
  isCopiedPaymentNumber: boolean;
  grandTotal: number;
  formatBDT: (amount: number, lang?: any) => string;
  trxId: string;
  setTrxId: (v: string) => void;
  cardNumber: string;
  setCardNumber: (v: string) => void;
  cardExpiry: string;
  setCardExpiry: (v: string) => void;
  cardCvv: string;
  setCardCvv: (v: string) => void;
  cardName: string;
  setCardName: (v: string) => void;
  allowedMethods?: ('cod' | 'bkash' | 'nagad' | 'card')[];
}

export const CheckoutPaymentSelector: React.FC<CheckoutPaymentSelectorProps> = ({
    paymentMethod,
  setPaymentMethod,
  officialPaymentNumber,
  handleCopy,
  isCopiedPaymentNumber,
  grandTotal,
  formatBDT,
  trxId,
  setTrxId,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvv,
  setCardCvv,
  cardName,
  setCardName,
  allowedMethods = ['cod', 'bkash', 'nagad', 'card'],
}) => {
  return (
    <div className="bg-white rounded-3xl border border-border-color p-5 shadow-xs font-sans space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border-color">
        <span className="text-xs font-medium text-text-main flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-primary" />
          {'Payment Method'}
        </span>
        <span className="text-2xs text-text-muted font-medium">
          {'Secure'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* COD Button */}
        {(() => {
          const isAllowed = allowedMethods.includes('cod');
          const isSelected = paymentMethod === 'cod';
          return (
            <button
              type="button"
              disabled={!isAllowed}
              onClick={() => isAllowed && setPaymentMethod('cod')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                !isAllowed
                  ? 'bg-surface-subtle text-text-muted border-border-color opacity-60 cursor-not-allowed select-none'
                  : isSelected
                  ? 'bg-primary-light text-text-main border-primary shadow-xs cursor-pointer'
                  : 'bg-white text-text-main border-border-color hover:bg-surface-subtle cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isAllowed ? (
                  <Truck className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                ) : (
                  <Lock className="w-3 h-3 text-text-muted shrink-0" />
                )}
                <span className="font-medium text-xs">{'Cash On Delivery'}</span>
              </div>
              <div className="text-2xs opacity-75 mt-1 font-sans">
                {!isAllowed 
                  ? ('Not available for current items')
                  : ('Pay upon parcel inspection')}
              </div>
            </button>
          );
        })()}

        {/* bKash Button */}
        {(() => {
          const isAllowed = allowedMethods.includes('bkash');
          const isSelected = paymentMethod === 'bkash';
          return (
            <button
              type="button"
              disabled={!isAllowed}
              onClick={() => isAllowed && setPaymentMethod('bkash')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                !isAllowed
                  ? 'bg-surface-subtle text-text-muted border-border-color opacity-60 cursor-not-allowed select-none'
                  : isSelected
                  ? 'bg-primary-light text-text-main border-primary shadow-xs cursor-pointer'
                  : 'bg-white text-text-main border-border-color hover:bg-surface-subtle cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isAllowed ? (
                  <Smartphone className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                ) : (
                  <Lock className="w-3 h-3 text-text-muted shrink-0" />
                )}
                <span className="font-medium text-xs">bKash</span>
              </div>
              <div className="text-2xs opacity-75 mt-1 font-sans">
                {!isAllowed
                  ? ('Not available for current items')
                  : ('Direct bKash Wallet')}
              </div>
            </button>
          );
        })()}

        {/* Nagad Button */}
        {(() => {
          const isAllowed = allowedMethods.includes('nagad');
          const isSelected = paymentMethod === 'nagad';
          return (
            <button
              type="button"
              disabled={!isAllowed}
              onClick={() => isAllowed && setPaymentMethod('nagad')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                !isAllowed
                  ? 'bg-surface-subtle text-text-muted border-border-color opacity-60 cursor-not-allowed select-none'
                  : isSelected
                  ? 'bg-primary-light text-text-main border-primary shadow-xs cursor-pointer'
                  : 'bg-white text-text-main border-border-color hover:bg-surface-subtle cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isAllowed ? (
                  <Smartphone className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                ) : (
                  <Lock className="w-3 h-3 text-text-muted shrink-0" />
                )}
                <span className="font-medium text-xs">Nagad</span>
              </div>
              <div className="text-2xs opacity-75 mt-1 font-sans">
                {!isAllowed
                  ? ('Not available for current items')
                  : ('Instant Nagad Wallet')}
              </div>
            </button>
          );
        })()}

        {/* Card Button */}
        {(() => {
          const isAllowed = allowedMethods.includes('card');
          const isSelected = paymentMethod === 'card';
          return (
            <button
              type="button"
              disabled={!isAllowed}
              onClick={() => isAllowed && setPaymentMethod('card')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                !isAllowed
                  ? 'bg-surface-subtle text-text-muted border-border-color opacity-60 cursor-not-allowed select-none'
                  : isSelected
                  ? 'bg-primary-light text-text-main border-primary shadow-xs cursor-pointer'
                  : 'bg-white text-text-main border-border-color hover:bg-surface-subtle cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isAllowed ? (
                  <CreditCard className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                ) : (
                  <Lock className="w-3 h-3 text-text-muted shrink-0" />
                )}
                <span className="font-medium text-xs">{'Debit/Credit Card'}</span>
              </div>
              <div className="text-2xs opacity-75 mt-1 font-sans">
                {!isAllowed
                  ? ('Not available for current items')
                  : 'Visa / Mastercard / Amex'}
              </div>
            </button>
          );
        })()}
      </div>

      {/* Mobile Banking Real Instruction & TrxID Input */}
      {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
        <div className="p-3.5 rounded-2xl bg-surface-subtle border border-border-color space-y-3 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-border-color">
            <div>
              <span className="font-medium text-text-main">
                {paymentMethod === 'bkash' ? 'MAGMATI Official bKash Number:' : 'MAGMATI Official Nagad Number:'}
              </span>
              <div className="font-mono font-bold text-sm text-primary mt-0.5">
                {officialPaymentNumber}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(officialPaymentNumber, 'phone')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-border-color text-2xs font-medium text-text-main hover:bg-surface-subtle cursor-pointer"
            >
              {isCopiedPaymentNumber ? (
                <span className="text-emerald-600 font-medium">✓ Copied</span>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-text-muted" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <ol className="list-decimal list-inside text-2xs text-text-muted space-y-1">
            <li>Go to your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} app &apos;Send Money&apos; or &apos;Payment&apos; option.</li>
            <li>Send <strong>{formatBDT(grandTotal)}</strong> to the above number.</li>
            <li>Once payment is complete, enter your Transaction ID (TrxID) below.</li>
          </ol>

          <div className="pt-1">
            <label className="text-2xs font-medium text-text-main block mb-1">
              Transaction ID (TrxID) *
            </label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value.toUpperCase())}
              placeholder="e.g. BL89X492A"
              className="w-full h-9 px-3 text-xs font-mono font-medium uppercase bg-white border border-border-color rounded-xl focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>
      )}

      {/* Credit/Debit Card Details Form with Visual Real-Time Card Preview */}
      {paymentMethod === 'card' && (
        <div className="p-4 rounded-2xl bg-surface-subtle border border-border-color space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Elegant Visual Credit Card Preview */}
          <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-black p-5 text-white flex flex-col justify-between overflow-hidden shadow-card border border-zinc-700 font-sans select-none">
            {/* Hologram Card Chip and Card Type */}
            <div className="flex items-start justify-between">
              {/* Holographic Card Chip */}
              <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300 border border-amber-300/40 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-radial-gradient(from_center,_circle,_transparent,_rgba(0,0,0,0.2))" />
                <div className="w-6 h-5 border border-zinc-800/20 rounded-xs flex flex-wrap gap-0.5 p-0.5 justify-center items-center">
                  <div className="w-1.5 h-1 bg-zinc-800/10" />
                  <div className="w-1.5 h-1 bg-zinc-800/10" />
                  <div className="w-1.5 h-1 bg-zinc-800/10" />
                  <div className="w-1.5 h-1 bg-zinc-800/10" />
                </div>
              </div>

              {/* Dynamic Brand Logo */}
              <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-400">
                {cardNumber.replace(/\s+/g, '').startsWith('4') ? (
                  <span className="text-sky-400 font-extrabold italic text-sm">VISA</span>
                ) : cardNumber.replace(/\s+/g, '').startsWith('5') ? (
                  <span className="text-orange-400 font-extrabold italic text-sm">MASTERCARD</span>
                ) : (
                  <span className="text-zinc-300 font-medium text-2xs">PREMIUM CARD</span>
                )}
              </div>
            </div>

            {/* Simulated Wireless Symbol */}
            <div className="absolute top-16 right-5 opacity-40">
              <svg className="w-5 h-5 fill-current text-white transform rotate-90" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61l1.42-1.42C5.51 15.11 5 13.61 5 12c0-3.87 3.13-7 7-7s7 3.13 7 7c0 1.61-.51 3.11-1.39 4.19l1.42 1.42C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9zm0 4c-2.76 0-5 2.24-5 5 0 1.18.41 2.27 1.09 3.13l1.42-1.42C9.17 13.13 9 12.58 9 12c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .58-.17 1.13-.51 1.71l1.42 1.42c.68-.86 1.09-1.95 1.09-3.13 0-2.76-2.24-5-5-5zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
              </svg>
            </div>

            {/* Live Card Number */}
            <div className="text-base sm:text-lg font-mono font-bold tracking-widest text-center py-1 select-all text-zinc-100">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>

            {/* Live Cardholder Name & Expiry Date */}
            <div className="flex items-end justify-between font-sans">
              <div className="space-y-0.5 truncate max-w-[70%]">
                <span className="text-2xs text-zinc-400 font-medium block">
                  {'Cardholder Name'}
                </span>
                <span className="text-2xs font-semibold uppercase tracking-wide block truncate">
                  {cardName.trim() || 'JOHN DOE'}
                </span>
              </div>
              <div className="space-y-0.5 shrink-0">
                <span className="text-2xs text-zinc-400 font-medium block">
                  {'Expires End'}
                </span>
                <span className="text-2xs font-mono font-semibold block">
                  {cardExpiry || 'MM/YY'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Card Details Form Fields */}
          <div className="space-y-2.5 text-xs font-sans">
            <div>
              <label className="text-2xs font-medium text-text-main block mb-1">
                {'Cardholder Name *'}
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="e.g. MD. ASADUZAMAN"
                className="w-full h-9 px-3 text-xs bg-white border border-border-color rounded-xl focus:border-primary focus:outline-hidden"
                maxLength={40}
              />
            </div>

            <div>
              <label className="text-2xs font-medium text-text-main block mb-1">
                {'Card Number *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    const formatted = clean
                      .substring(0, 16)
                      .replace(/(\d{4})/g, '$1 ')
                      .trim();
                    setCardNumber(formatted);
                  }}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full h-9 pl-9 pr-3 text-xs font-mono font-medium bg-white border border-border-color rounded-xl focus:border-primary focus:outline-hidden"
                  maxLength={19}
                />
                <CreditCard className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-medium text-text-main block mb-1">
                  {'Expiry Date (MM/YY) *'}
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    let formatted = clean.slice(0, 4);
                    if (formatted.length >= 2) {
                      formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`;
                    }
                    setCardExpiry(formatted);
                  }}
                  placeholder="MM/YY"
                  className="w-full h-9 px-3 text-xs font-mono font-medium bg-white border border-border-color rounded-xl focus:border-primary focus:outline-hidden"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="text-2xs font-medium text-text-main block mb-1">
                  CVC / CVV *
                </label>
                <input
                  type="password"
                  value={cardCvv}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setCardCvv(clean.slice(0, 4));
                  }}
                  placeholder="•••"
                  className="w-full h-9 px-3 text-xs font-mono font-medium bg-white border border-border-color rounded-xl focus:border-primary focus:outline-hidden"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
