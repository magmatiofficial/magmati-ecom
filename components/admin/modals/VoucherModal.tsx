'use client';

import React from 'react';
import { X, Ticket, SlidersHorizontal, Settings2, ShieldCheck, Trash2 } from 'lucide-react';
import { Voucher } from '@/store/useVoucherStore';

interface CategoryItem {
  id: string;
  name: string;
}

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingVoucher: Voucher | null;
  
  categories?: CategoryItem[];
  vCode: string;
  setVCode: (v: string) => void;
  vTitle?: string;
  setVTitle?: (v: string) => void;
  vTitleEn?: string;
  setVTitleEn?: (v: string) => void;
  
  vDiscountType: 'fixed' | 'percentage' | 'free_shipping';
  setVDiscountType: (v: 'fixed' | 'percentage' | 'free_shipping') => void;
  vDiscountValue: number;
  setVDiscountValue: (v: number) => void;
  vMinSpend: number;
  setVMinSpend: (v: number) => void;
  vMaxDiscount?: number;
  setVMaxDiscount: (v: number | undefined) => void;
  vCondition?: string;
  setVCondition?: (v: string) => void;
  vConditionEn?: string;
  setVConditionEn?: (v: string) => void;
  
  vBadge?: string;
  setVBadge?: (v: string) => void;
  vBadgeEn?: string;
  setVBadgeEn?: (v: string) => void;
  
  vBgGradient: string;
  setVBgGradient: (v: string) => void;
  vPaymentMethod: 'all' | 'bkash' | 'nagad' | 'cod' | 'card';
  setVPaymentMethod: (v: 'all' | 'bkash' | 'nagad' | 'cod' | 'card') => void;
  vRequiresLogin: boolean;
  setVRequiresLogin: (v: boolean) => void;
  vApplicableCategory: string;
  setVApplicableCategory: (v: string) => void;
  vExpiresAt: string;
  setVExpiresAt: (v: string) => void;
  
  // Advanced Conditions
  vMaxUsesPerCustomer?: number;
  setVMaxUsesPerCustomer: (v: number | undefined) => void;
  vMaxDiscountSpendPerUser?: number;
  setVMaxDiscountSpendPerUser: (v: number | undefined) => void;
  vTotalDiscountBudget?: number;
  setVTotalDiscountBudget: (v: number | undefined) => void;
  vAutoRemoveDaysAfterExpiry: number;
  setVAutoRemoveDaysAfterExpiry: (v: number) => void;
  
  onSubmit?: (e: React.FormEvent) => void;
  handleSubmit?: (e: React.FormEvent) => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  editingVoucher,
  categories = [],
  vCode,
  setVCode,
  vTitle,
  setVTitle,
  vTitleEn,
  setVTitleEn,
  vDiscountType,
  setVDiscountType,
  vDiscountValue,
  setVDiscountValue,
  vMinSpend,
  setVMinSpend,
  vMaxDiscount,
  setVMaxDiscount,
  vCondition,
  setVCondition,
  vConditionEn,
  setVConditionEn,
  vBadge,
  setVBadge,
  vBadgeEn,
  setVBadgeEn,
  vBgGradient,
  setVBgGradient,
  vPaymentMethod,
  setVPaymentMethod,
  vRequiresLogin,
  setVRequiresLogin,
  vApplicableCategory,
  setVApplicableCategory,
  vExpiresAt,
  setVExpiresAt,
  
  // Advanced Conditions
  vMaxUsesPerCustomer,
  setVMaxUsesPerCustomer,
  vMaxDiscountSpendPerUser,
  setVMaxDiscountSpendPerUser,
  vTotalDiscountBudget,
  setVTotalDiscountBudget,
  vAutoRemoveDaysAfterExpiry,
  setVAutoRemoveDaysAfterExpiry,
  
  onSubmit,
  handleSubmit,
}) => {
  if (!isOpen) return null;

  const currentTitle = vTitle ?? vTitleEn ?? '';
  const onTitleChange = (val: string) => {
    if (setVTitle) setVTitle(val);
    if (setVTitleEn) setVTitleEn(val);
  };

  const currentCondition = vCondition ?? vConditionEn ?? '';
  const onConditionChange = (val: string) => {
    if (setVCondition) setVCondition(val);
    if (setVConditionEn) setVConditionEn(val);
  };

  const currentBadge = vBadge ?? vBadgeEn ?? '';
  const onBadgeChange = (val: string) => {
    if (setVBadge) setVBadge(val);
    if (setVBadgeEn) setVBadgeEn(val);
  };

  const onFormSubmit = onSubmit ?? handleSubmit ?? ((e: React.FormEvent) => e.preventDefault());
  

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 my-auto max-h-[88dvh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                {editingVoucher
                  ? ('Edit Voucher & Conditions')
                  : ('Create New Promo Voucher')}
              </h3>
              <p className="text-eyebrow text-zinc-500">
                {editingVoucher
                  ? (`Editing voucher code: ${editingVoucher.code}`)
                  : ('Configure discounts, spend rules & payment restrictions')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onFormSubmit} className="space-y-4 pt-4 text-xs font-sans">
          
          {/* Section 1: Basic Promo details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                {'Voucher Promo Code *'}
              </label>
              <input
                type="text"
                required
                value={vCode}
                onChange={(e) => setVCode(e.target.value.toUpperCase())}
                placeholder="e.g. EID500"
                className="w-full h-10 px-3 uppercase font-mono font-bold border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                {'Discount Type *'}
              </label>
              <select
                value={vDiscountType}
                onChange={(e) => setVDiscountType(e.target.value as 'fixed' | 'percentage' | 'free_shipping')}
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden font-medium"
              >
                <option value="fixed">Fixed BDT Amount</option>
                <option value="percentage">Percentage Discount (%)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
          </div>

          {/* Section 2: Financial Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                {vDiscountType === 'percentage' 
                  ? ('Discount % *') 
                  : vDiscountType === 'fixed' 
                  ? ('Discount ৳ *') 
                  : ('Coverage ৳')}
              </label>
              <input
                type="number"
                required
                min={1}
                value={vDiscountValue}
                onChange={(e) => setVDiscountValue(Number(e.target.value))}
                placeholder={vDiscountType === 'percentage' ? '15' : '200'}
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                {'Min Spend (৳) *'}
              </label>
              <input
                type="number"
                required
                min={0}
                value={vMinSpend}
                onChange={(e) => setVMinSpend(Number(e.target.value))}
                placeholder="1000"
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                {'Max Cap / Limit (৳)'}
              </label>
              <input
                type="number"
                min={1}
                value={vMaxDiscount || ''}
                onChange={(e) => setVMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={'Optional (e.g. 500)'}
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          {/* Section 3: Advanced Restrictions & Admin Controls */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>{'Offer Rules & Target Conditions'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                  {'Payment Method Requirement'}
                </label>
                <select
                  value={vPaymentMethod}
                  onChange={(e) => setVPaymentMethod(e.target.value as 'all' | 'bkash' | 'nagad' | 'cod' | 'card')}
                  className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden focus:border-primary"
                >
                  <option value="all">All Payment Methods</option>
                  <option value="bkash">bKash Online Only</option>
                  <option value="nagad">Nagad Online Only</option>
                  <option value="cod">Cash on Delivery Only</option>
                  <option value="card">Cards Payment Only</option>
                </select>
              </div>

              <div>
                <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                  {'Applicable Category'}
                </label>
                <select
                  value={vApplicableCategory}
                  onChange={(e) => setVApplicableCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden focus:border-primary"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                  {'Expiration Date'}
                </label>
                <input
                  type="date"
                  value={vExpiresAt}
                  onChange={(e) => setVExpiresAt(e.target.value)}
                  className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="pt-2 sm:pt-4">
                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-zinc-200 cursor-pointer hover:bg-zinc-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={vRequiresLogin}
                    onChange={(e) => setVRequiresLogin(e.target.checked)}
                    className="w-4 h-4 text-primary rounded accent-primary"
                  />
                  <span className="text-eyebrow font-bold text-zinc-800">
                    {'Requires Registered App Account Login'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Highly Configurable Smart Limits (Customer-Specific & Budget Settings) */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{'Smart Customer Limits & Campaign Budget'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                  {'Max Uses Per Customer'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={vMaxUsesPerCustomer || ''}
                  onChange={(e) => setVMaxUsesPerCustomer(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder={'e.g. 1 or 2 (Optional)'}
                  className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden focus:border-primary font-medium"
                />
                <span className="text-2xs text-zinc-400 block mt-0.5">
                  {'How many times a single customer can redeem this code'}
                </span>
              </div>

              <div>
                <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                  {'Max Discount Spend Per Customer (৳)'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={vMaxDiscountSpendPerUser || ''}
                  onChange={(e) => setVMaxDiscountSpendPerUser(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder={'e.g. 1000 (Optional)'}
                  className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden focus:border-primary font-medium"
                />
                <span className="text-2xs text-zinc-400 block mt-0.5">
                  {'Maximum lifetime discount limit (in BDT) a single user can get'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                  {'Total Campaign Discount Budget (৳)'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={vTotalDiscountBudget || ''}
                  onChange={(e) => setVTotalDiscountBudget(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder={'e.g. 50000 (Optional)'}
                  className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden focus:border-primary font-medium"
                />
                <span className="text-2xs text-zinc-400 block mt-0.5">
                  {'Voucher disables once total given discount reaches this budget limit'}
                </span>
              </div>

              <div>
                <label className="text-eyebrow font-bold text-zinc-700 block mb-1">
                  {'Auto-Remove Days After Expiry'}
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={vAutoRemoveDaysAfterExpiry}
                  onChange={(e) => setVAutoRemoveDaysAfterExpiry(Number(e.target.value))}
                  placeholder="3"
                  className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden focus:border-primary font-medium"
                />
                <span className="text-2xs text-zinc-400 block mt-0.5">
                  {'Number of days to keep voucher card visible in account before auto-deleting'}
                </span>
              </div>
            </div>

            {editingVoucher && (
              <div className="p-2.5 bg-emerald-100/50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    {`Total Discount Distributed So Far: ৳${editingVoucher.usedDiscountBudget || 0}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Display Titles */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Title *</label>
              <input
                type="text"
                required
                value={currentTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. ৳200 Flat Off on Eid Collection"
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          {/* Section 6: Conditions text & badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Condition text</label>
              <input
                type="text"
                value={currentCondition}
                onChange={(e) => onConditionChange(e.target.value)}
                placeholder="e.g. On orders above ৳1,500"
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Badge Tag</label>
              <input
                type="text"
                value={currentBadge}
                onChange={(e) => onBadgeChange(e.target.value)}
                placeholder="e.g. MEGA SAVER"
                className="w-full h-10 px-3 uppercase border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">

            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Gradient Style</label>
              <select
                value={vBgGradient}
                onChange={(e) => setVBgGradient(e.target.value)}
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden focus:border-primary"
              >
                <option value="from-zinc-900 to-zinc-800">Classic Black / Slate</option>
                <option value="from-red-600 to-rose-700">Magmati Crimson Red</option>
                <option value="from-amber-600 to-yellow-600">Royal Gold / Amber</option>
                <option value="from-emerald-700 to-teal-800">Emerald Green</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-zinc-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              {'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {editingVoucher
                ? ('Update Voucher')
                : ('Create Voucher')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
