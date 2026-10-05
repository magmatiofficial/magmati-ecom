'use client';

import React from 'react';
import { X, ShieldCheck, Truck, RotateCcw, Lock, FileText, CheckCircle2 } from 'lucide-react';

export type PolicyType = 'shipping' | 'returns' | 'warranty' | 'privacy' | 'terms' | null;

interface FooterPolicyModalProps {
  policyType: PolicyType;
  onClose: () => void;
}

export const FooterPolicyModal: React.FC<FooterPolicyModalProps> = ({ policyType, onClose }) => {
  if (!policyType) return null;

  const getPolicyContent = () => {
    switch (policyType) {
      case 'shipping':
        return {
          titleEn: 'Shipping Rates & Delivery Timeline',
          icon: Truck,
          contentEn: (
            <div className="space-y-4 text-xs text-text-muted leading-relaxed font-sans">
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-color space-y-2">
                <h4 className="font-bold text-sm text-text-main">🚚 Rates & Delivery Schedules:</h4>
                <ul className="list-disc list-inside space-y-1 text-text-muted">
                  <li><strong>Inside Dhaka City:</strong> ৳60 (Delivered within 24 to 48 hours).</li>
                  <li><strong>Outside Dhaka (All 64 Districts):</strong> ৳100 (Delivered within 48 to 72 hours).</li>
                  <li><strong>Free Delivery Privilege:</strong> Enjoy 100% Free Shipping on all orders above ৳2,500.</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-text-main">📦 Order Tracking & Doorstep Inspection:</h4>
                <p>You will receive an automated tracking link via SMS. Delivery executives will call ahead before arrival. You may inspect the parcel condition at doorstep before completing Cash on Delivery.</p>
              </div>
            </div>
          )
        };

      case 'returns':
        return {
          titleEn: '7-Day Easy Return & Replacement Guarantee',
          icon: RotateCcw,
          contentEn: (
            <div className="space-y-4 text-xs text-text-muted leading-relaxed font-sans">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <h4 className="font-bold text-sm text-emerald-900">✨ 100% Hassle-Free Replacement Guarantee:</h4>
                <p>If you experience any size misfit, defect, or damage within 7 days of delivery, we provide an instant replacement or full refund with zero penalty.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-text-main">📋 Step-by-Step Return Process:</h4>
                <ul className="list-disc list-inside space-y-1 text-text-muted">
                  <li>Original brand box, tags, and invoice must remain intact.</li>
                  <li>Contact our WhatsApp Support with your order number and product photos.</li>
                  <li>Our courier agent will pick up the package from your doorstep.</li>
                </ul>
              </div>
            </div>
          )
        };

      case 'warranty':
        return {
          titleEn: '100% Genuine Certified & Official Warranty',
          icon: ShieldCheck,
          contentEn: (
            <div className="space-y-4 text-xs text-text-muted leading-relaxed font-sans">
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-color space-y-2">
                <h4 className="font-bold text-sm text-text-main">🛡️ Official Brand Authenticity & Claims:</h4>
                <p>All electronics, smartwatches, and appliances available on MAGMATI are 100% authentic, sourced directly from authorized manufacturers with genuine warranty coverage.</p>
              </div>
            </div>
          )
        };

      case 'privacy':
        return {
          titleEn: 'Privacy Policy & Data Security',
          icon: Lock,
          contentEn: (
            <div className="space-y-4 text-xs text-text-muted leading-relaxed font-sans">
              <p>Your personal identifiable information is securely guarded under 256-bit SSL encryption and strict data protection standards. We never sell or distribute customer data.</p>
            </div>
          )
        };

      case 'terms':
      default:
        return {
          titleEn: 'Terms of Service & Consumer Rights',
          icon: FileText,
          contentEn: (
            <div className="space-y-4 text-xs text-text-muted leading-relaxed font-sans">
              <p>By purchasing on MAGMATI, you are protected under the Consumer Rights Protection laws and e-CAB merchant standards of Bangladesh.</p>
            </div>
          )
        };
    }
  };

  const policy = getPolicyContent();
  const Icon = policy.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-border-color animate-scale-in max-h-[85dvh] overflow-y-auto custom-scrollbar-thin">
        <div className="flex items-center justify-between border-b border-border-color pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-text-main tracking-tight font-sans">
                {policy.titleEn}
              </h3>
              <span className="text-2xs text-text-subtle font-bold uppercase tracking-wider">MAGMATI Consumer Policy</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-subtle hover:text-text-main rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          {policy.contentEn}
        </div>

        <div className="pt-3 border-t border-border-color flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-surface-dark hover:bg-primary text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {'Got it / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
