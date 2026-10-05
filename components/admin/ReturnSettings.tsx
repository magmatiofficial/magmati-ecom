'use client';

import React from 'react';
import Link from 'next/link';
import { 
  RotateCcw, 
  Eye, 
  ExternalLink, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MessageSquare 
} from 'lucide-react';
import { INSIDE_DHAKA_DELIVERY_FEE_BDT, OUTSIDE_DHAKA_DELIVERY_FEE_BDT } from '@/lib/constants';

interface ReturnSettingsProps {
  siteSettings: {
    enableReturns?: boolean;
    returnWindowDays?: number;
    maxPhotoUploads?: number;
    requirePhotoUpload?: boolean;
    allowMindChangeReturns?: boolean;
    insideDhakaReturnFee?: number;
    outsideDhakaReturnFee?: number;
    enableBkashRefund?: boolean;
    enableNagadRefund?: boolean;
    enableRocketRefund?: boolean;
    enableBankRefund?: boolean;
    returnPageTitle?: string;
    returnPageSubtitle?: string;
    showUnboxingNotice?: boolean;
    unboxingNoticeText?: string;
    returnPolicyNotes?: string;
    updateSettings: (fields: any) => void;
  };
}

export const ReturnSettings: React.FC<ReturnSettingsProps> = ({ siteSettings }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
        <div>
          <h4 className="font-bold text-text-main text-sm flex items-center gap-2">
            <RotateCcw className="w-4.5 h-4.5 text-primary" />
            <span>{'Returns & Refund Page UI Control'}</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            {'Configure customer returns form, allowed refund payout methods, courier deductions, unboxing requirements, and rules.'}
          </p>
        </div>
        <Link
          href="/returns"
          target="_blank"
          className="px-3.5 py-1.5 bg-surface-subtle hover:bg-zinc-200 text-text-main rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 border border-border-color cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-primary" />
          <span>{'View Live Returns Page'}</span>
          <ExternalLink className="w-3 h-3 text-text-subtle" />
        </Link>
      </div>

      {/* 1. Master System Toggles & Eligibility Policy */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-color/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-color flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-text-main text-xs sm:text-sm">
                {'Customer Returns System'}
              </h5>
              <p className="text-2xs text-text-muted">
                {'Enable or pause customer return requests across the store.'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={siteSettings.enableReturns !== false}
              onChange={(e) => siteSettings.updateSettings({ enableReturns: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-hover after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Policy Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-white border border-border-color rounded-xl shadow-3xs space-y-1.5">
            <label className="font-bold text-text-main block">
              {'Return Window (Days):'}
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={siteSettings.returnWindowDays ?? 7}
              onChange={(e) => siteSettings.updateSettings({ returnWindowDays: Number(e.target.value) || 7 })}
              className="w-full h-9 px-3 bg-surface-subtle border border-border-color rounded-lg font-bold text-text-main focus:bg-white focus:outline-hidden"
            />
            <p className="text-2xs text-text-subtle">Allowed days after delivery</p>
          </div>

          <div className="p-3.5 bg-white border border-border-color rounded-xl shadow-3xs space-y-1.5">
            <label className="font-bold text-text-main block">
              {'Max Evidence Photos:'}
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={siteSettings.maxPhotoUploads ?? 5}
              onChange={(e) => siteSettings.updateSettings({ maxPhotoUploads: Number(e.target.value) || 5 })}
              className="w-full h-9 px-3 bg-surface-subtle border border-border-color rounded-lg font-bold text-text-main focus:bg-white focus:outline-hidden"
            />
            <p className="text-2xs text-text-subtle">Max photo upload count</p>
          </div>

          <div className="p-3.5 bg-white border border-border-color rounded-xl shadow-3xs flex flex-col justify-between">
            <div>
              <span className="font-bold text-text-main block">{'Strictly Require Photos'}</span>
              <span className="text-2xs text-text-muted block mt-0.5">{'Must upload invoice/product photo to submit'}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={siteSettings.requirePhotoUpload !== false}
                onChange={(e) => siteSettings.updateSettings({ requirePhotoUpload: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-hover after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="p-3.5 bg-white border border-border-color rounded-xl shadow-3xs flex flex-col justify-between">
            <div>
              <span className="font-bold text-text-main block">{'Mind Change Returns'}</span>
              <span className="text-2xs text-text-muted block mt-0.5">{'Allow returns if customer changed mind'}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={siteSettings.allowMindChangeReturns !== false}
                onChange={(e) => siteSettings.updateSettings({ allowMindChangeReturns: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-hover after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Return Courier Shipping Charges (Deducted from Refund) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-color/80 space-y-3">
        <div className="pb-2 border-b border-border-color">
          <h5 className="font-bold text-text-main text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-primary" />
            <span>{'Return Courier Shipping Charges'}</span>
          </h5>
          <p className="text-2xs text-text-muted mt-0.5">
            {'When a return/refund is approved, this courier pickup cost is automatically deducted to compute Net Refund.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3.5 bg-white rounded-xl border border-border-color shadow-3xs space-y-2">
            <label className="font-bold text-text-main block">
              {'Inside Dhaka Return Shipping Fee (BDT):'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-text-subtle">৳</span>
              <input
                type="number"
                min={0}
                value={siteSettings.insideDhakaReturnFee ?? 60}
                onChange={(e) => siteSettings.updateSettings({ insideDhakaReturnFee: Number(e.target.value) || 0 })}
                className="w-full h-10 pl-7 pr-3 bg-surface-subtle border border-border-color rounded-lg focus:bg-white focus:outline-hidden font-bold text-sm text-text-main"
              />
            </div>
            <p className="text-2xs text-text-subtle">Default: ৳{INSIDE_DHAKA_DELIVERY_FEE_BDT} (Dhaka City)</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-border-color shadow-3xs space-y-2">
            <label className="font-bold text-text-main block">
              {'Outside Dhaka Return Shipping Fee (BDT):'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-text-subtle">৳</span>
              <input
                type="number"
                min={0}
                value={siteSettings.outsideDhakaReturnFee ?? 120}
                onChange={(e) => siteSettings.updateSettings({ outsideDhakaReturnFee: Number(e.target.value) || 0 })}
                className="w-full h-10 pl-7 pr-3 bg-surface-subtle border border-border-color rounded-lg focus:bg-white focus:outline-hidden font-bold text-sm text-text-main"
              />
            </div>
            <p className="text-2xs text-text-subtle">Default: ৳{OUTSIDE_DHAKA_DELIVERY_FEE_BDT} (All districts across Bangladesh)</p>
          </div>
        </div>
      </div>

      {/* 3. Allowed Customer Refund Payout Gateways */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-color/80 space-y-3">
        <div className="pb-2 border-b border-border-color">
          <h5 className="font-bold text-text-main text-xs uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-primary" />
            <span>{'Allowed Customer Refund Payout Methods'}</span>
          </h5>
          <p className="text-2xs text-text-muted mt-0.5">
            {'Select which payout gateways customers can choose on the return application form.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="flex items-center gap-2.5 p-3 bg-white border border-border-color rounded-xl cursor-pointer hover:bg-surface-subtle/60 transition-colors shadow-3xs">
            <input
              type="checkbox"
              checked={siteSettings.enableBkashRefund !== false}
              onChange={(e) => siteSettings.updateSettings({ enableBkashRefund: e.target.checked })}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-text-main block">bKash</span>
              <span className="text-2xs text-pink-600 font-semibold">Personal Wallet</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 bg-white border border-border-color rounded-xl cursor-pointer hover:bg-surface-subtle/60 transition-colors shadow-3xs">
            <input
              type="checkbox"
              checked={siteSettings.enableNagadRefund !== false}
              onChange={(e) => siteSettings.updateSettings({ enableNagadRefund: e.target.checked })}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-text-main block">Nagad</span>
              <span className="text-2xs text-orange-600 font-semibold">Personal Wallet</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 bg-white border border-border-color rounded-xl cursor-pointer hover:bg-surface-subtle/60 transition-colors shadow-3xs">
            <input
              type="checkbox"
              checked={siteSettings.enableRocketRefund !== false}
              onChange={(e) => siteSettings.updateSettings({ enableRocketRefund: e.target.checked })}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-text-main block">Rocket</span>
              <span className="text-2xs text-purple-600 font-semibold">DBBL Rocket</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 bg-white border border-border-color rounded-xl cursor-pointer hover:bg-surface-subtle/60 transition-colors shadow-3xs">
            <input
              type="checkbox"
              checked={siteSettings.enableBankRefund !== false}
              onChange={(e) => siteSettings.updateSettings({ enableBankRefund: e.target.checked })}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-text-main block">Bank Transfer</span>
              <span className="text-2xs text-blue-600 font-semibold">BEFTN / NPSB</span>
            </div>
          </label>
        </div>
      </div>

      {/* 4. Storefront Headings, Unboxing Notice & Custom Copy */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-color/80 space-y-4 text-xs font-sans">
        <div className="pb-2 border-b border-border-color">
          <h5 className="font-bold text-text-main text-xs uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>{'Storefront Header, Unboxing Notice & Custom Copy'}</span>
          </h5>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-text-muted block mb-1">{'Return Page Main Title'}</label>
            <input
              type="text"
              value={siteSettings.returnPageTitle || 'Request Product Return'}
              onChange={(e) => siteSettings.updateSettings({ returnPageTitle: e.target.value })}
              className="w-full h-10 px-3 bg-white border border-border-color rounded-xl text-xs sm:text-sm font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-text-muted block mb-1">{'Return Page Subtitle / Tagline'}</label>
            <input
              type="text"
              value={siteSettings.returnPageSubtitle || 'Submit a return request within the allowed policy window.'}
              onChange={(e) => siteSettings.updateSettings({ returnPageSubtitle: e.target.value })}
              className="w-full h-10 px-3 bg-white border border-border-color rounded-xl text-xs sm:text-sm font-semibold"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border-color">
          <div className="flex items-center justify-between">
            <label className="font-bold text-text-muted flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={siteSettings.showUnboxingNotice !== false}
                onChange={(e) => siteSettings.updateSettings({ showUnboxingNotice: e.target.checked })}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <span>{'Show Mandatory Unboxing & Invoice Photo Notice on Return Form'}</span>
            </label>
            <span className="text-2xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              FRAUD PREVENTION
            </span>
          </div>

          <textarea
            rows={2}
            value={siteSettings.unboxingNoticeText || '📢 Upon receiving, unbox immediately and take a clear photo of the product next to the printed invoice. This photo is strictly REQUIRED to submit a return application.'}
            onChange={(e) => siteSettings.updateSettings({ unboxingNoticeText: e.target.value })}
            className="w-full p-3 bg-white border border-border-color rounded-xl text-xs font-medium resize-none leading-relaxed"
          />
        </div>

        <div className="space-y-1.5 pt-2 border-t border-border-color">
          <label className="font-bold text-text-muted block">{'Custom Return Policy Guidelines & Instructions'}</label>
          <textarea
            rows={3}
            value={siteSettings.returnPolicyNotes || 'Items must be unused, in original packaging with tags intact. Refunds will be disbursed within 24-48 hours after courier pickup verification.'}
            onChange={(e) => siteSettings.updateSettings({ returnPolicyNotes: e.target.value })}
            className="w-full p-3 bg-white border border-border-color rounded-xl text-xs font-medium resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
