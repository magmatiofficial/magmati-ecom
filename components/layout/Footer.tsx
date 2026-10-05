/**
 * @file components/layout/Footer.tsx
 * @description High-converting, comprehensive marketplace footer with social media channels,
 * VIP club rewards, guaranteed service policies, payment mesh, and department navigation.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  BadgePercent, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  Heart, 
  ExternalLink,
  QrCode,
  Smartphone,
  ChevronRight,
  Headphones
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { FooterGuarantees } from '@/components/layout/FooterGuarantees';
import { FooterPaymentPartners } from '@/components/layout/FooterPaymentPartners';
import { FooterSocialIcons } from '@/components/layout/FooterSocialIcons';
import { FooterPolicyModal, PolicyType } from '@/components/layout/FooterPolicyModal';

export function Footer() {
  const { supportPhone, supportEmail, whatsappNumber } = useSiteSettingsStore();
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  return (
    <footer className="bg-secondary text-white border-t border-zinc-800 pb-20 md:pb-0 font-sans relative">
      {/* 1. Brand Value Guarantee Strip */}
      <FooterGuarantees  />

      {/* 2. Main Footer Directory Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Column 1: Brand Story, Contact & Social Media */}
          <div className="lg:col-span-2 space-y-5">
            <BrandLogo theme="dark" size="md" />

            <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-sm">
              {'Bangladesh’s premier curated lifestyle marketplace for Men’s Fashion, Smart Electronics, Home Appliances, Kids & Beauty products with nationwide fast delivery.'}
            </p>

            {/* Direct Official Contact Cards */}
            <div className="space-y-2.5 text-xs text-zinc-300 font-sans">
              <a
                href={`tel:${supportPhone || '+8809612345678'}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono font-bold">{supportPhone || '+880 9612-445566'} (24/7 Helpline)</span>
              </a>

              <a
                href={`mailto:${supportEmail || 'support@magmati.com'}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono">{supportEmail || 'support@magmati.com'}</span>
              </a>

              <div className="flex items-start gap-2.5 text-zinc-400">
                <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-200 shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs leading-snug">
                  {'Level 7, Concord Tower, Gulshan-2, Dhaka-1212, Bangladesh'}
                </span>
              </div>
            </div>

            {/* Social Media Platform Channels */}
            <div className="pt-2 border-t border-zinc-800/80">
              <FooterSocialIcons  />
            </div>
          </div>

          {/* Column 2: Marketplace Departments */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 font-sans flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>{'DEPARTMENTS'}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-sans">
              <li>
                <Link href="/shop?category=Men%27s+Fashion" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{"Men's Ethnic & Panjabi"}</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Women%27s+Fashion" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{"Women's Saree & Kurti"}</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Electronics+%26+Gadgets" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{'Smart Tech & Audio Gear'}</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Home+%26+Kitchen+Appliances" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{'Kitchen & Home Appliances'}</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Kids+%26+Baby+Care" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{'Baby Care, Toys & Wear'}</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Beauty+%26+Personal+Care" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{'Beauty, Skincare & Oud'}</span>
                </Link>
              </li>
              <li className="pt-1.5 border-t border-zinc-800/80">
                <Link href="/category" className="font-bold text-brand-gold hover:text-white transition-colors flex items-center gap-1">
                  <span>{'All Departments Index →'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Policy Guides */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 font-sans flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>{'CUSTOMER CARE'}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-sans">
              <li>
                <Link href="/track" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{'Live Order Tracking'}</span>
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span className="text-brand-gold font-bold">{'Request Product Return'}</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('shipping')}
                  className="hover:text-primary transition-colors flex items-center gap-1 text-left cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{'Shipping Rates & Timelines'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('returns')}
                  className="hover:text-primary transition-colors flex items-center gap-1 text-left cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{'7-Day Return & Replacement'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('warranty')}
                  className="hover:text-primary transition-colors flex items-center gap-1 text-left cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{'100% Genuine Brand Warranty'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('privacy')}
                  className="hover:text-primary transition-colors flex items-center gap-1 text-left cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{'Privacy & Security Standards'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('terms')}
                  className="hover:text-primary transition-colors flex items-center gap-1 text-left cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{'Terms & Consumer Rights'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Links & Payment Gateways */}
          <div>
            <FooterPaymentPartners  />
          </div>

        </div>
      </div>

      {/* Interactive Policy Modal */}
      <FooterPolicyModal
        policyType={activePolicy}
        onClose={() => setActivePolicy(null)}
        
      />
    </footer>
  );
}
