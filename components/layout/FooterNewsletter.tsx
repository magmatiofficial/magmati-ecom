'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Check, 
  Copy, 
  Gift, 
  PhoneCall, 
  MessageCircle, 
  Headphones,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { cleanWhatsAppNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface FooterNewsletterProps {
  
}

export const FooterNewsletter: React.FC<FooterNewsletterProps> = () => {
  const { supportPhone, whatsappNumber } = useSiteSettingsStore();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const promoCode = 'MAGMATI200';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;
    setSubscribed(true);
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: VIP Club Headline & Perks */}
        <div className="lg:col-span-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-brand-gold text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
            <span>{'MAGMATI VIP REWARDS CLUB'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight font-sans">
            {'Join the VIP Club & Get ৳200 OFF Your First Order!'}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans max-w-xl">
            {'Subscribe to unlock members-only flash discounts, seasonal drop alerts, and weekly gift coupons.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{'Zero Spam'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{'Instant ৳200 Voucher'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{'100% Free Sign Up'}</span>
            </span>
          </div>
        </div>

        {/* Right: Newsletter Input & Quick 24/7 Helpline */}
        <div className="lg:col-span-6 space-y-4">
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={'Enter your email address...'}
                    className="w-full h-12 px-4 rounded-xl border border-zinc-700 bg-zinc-900/90 text-white placeholder:text-zinc-500 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 px-6 uppercase tracking-wider font-black flex items-center justify-center gap-2 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{'Claim Voucher'}</span>
                </Button>
              </div>
              <p className="text-2xs text-zinc-500">
                {'* By subscribing, you agree to receive promotional updates & exclusive voucher alerts.'}
              </p>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/40 text-white space-y-2.5 animate-scale-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Check className="w-4 h-4" />
                <span>{'Awesome! You are now an official VIP Club member.'}</span>
              </div>
              
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-2xs text-zinc-400 uppercase font-bold block">{'YOUR DISCOUNT COUPON CODE'}</span>
                  <span className="text-sm font-mono font-black text-brand-gold tracking-widest">{promoCode}</span>
                  <span className="text-2xs text-zinc-400 block mt-0.5">{'Valid on orders above ৳1,500'}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCoupon}
                  className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedCoupon ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCoupon ? ('Copied!') : ('Copy Code')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Direct Contact Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Phone Support */}
            <a
              href={`tel:${supportPhone || '+8809612345678'}`}
              className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-2xs uppercase font-bold text-zinc-400">{'24/7 HELPLINE'}</span>
                </div>
                <span className="text-xs font-bold text-white font-mono block truncate mt-0.5">{supportPhone || '+880 9612-445566'}</span>
              </div>
            </a>

            {/* WhatsApp Chat */}
            <a
              href={`https://wa.me/${cleanWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent('Hello MAGMATI, I need assistance regarding an order.')}`}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-2xs uppercase font-bold text-zinc-400">{'INSTANT WHATSAPP'}</span>
                </div>
                <span className="text-xs font-bold text-white block truncate mt-0.5">{'Chat Live with Agent'}</span>
              </div>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
