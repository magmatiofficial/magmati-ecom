'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Settings, 
  Truck, 
  Layers, 
  Sliders, 
  Upload, 
  Flame, 
  LayoutGrid, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Database, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  Mail, 
  MessageSquare, 
  AlertCircle, 
  ChevronDown, 
  Eye, 
  CreditCard, 
  Shield, 
  Clock, 
  Camera, 
  Palette, 
  HelpCircle,
  ExternalLink,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { INSIDE_DHAKA_DELIVERY_FEE_BDT, OUTSIDE_DHAKA_DELIVERY_FEE_BDT } from '@/lib/constants';
import { BestDealsTab } from './BestDealsTab';
import { ImageUploadField } from './ImageUploadField';
import { exportFullStoreBackup } from '@/lib/dataTransferUtils';
import { useProductStore } from '@/store/useProductStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useVoucherStore } from '@/store/useVoucherStore';

// New Modular Settings Sub-tabs
import { HomepageSettings } from './HomepageSettings';
import { ReturnSettings } from './ReturnSettings';
import { BackupResetSettings } from './BackupResetSettings';

interface HeroSlide {
  id: string;
  image: string;
  titleEn: string;
  subtitleEn: string;
  badgeEn: string;
  buttonLink: string;
}

interface SmallBanner {
  titleEn: string;
  badgeEn: string;
  image: string;
  link: string;
}

interface SectionLayout {
  id: string;
  name: string;
  enabled: boolean;
  customTitle?: string;
  preset: string;
}

interface SiteSettingsType {
  appName: string;
  announcementText: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber?: string;
  insideDhakaDeliveryFee: number;
  outsideDhakaDeliveryFee: number;
  freeShippingThreshold: number;
  heroSlides: HeroSlide[];
  smallBanner1?: SmallBanner;
  smallBanner2?: SmallBanner;
  lowStockThreshold: number;
  flashSaleTitle?: string;
  flashSaleSubtitle?: string;
  flashSaleEndTime?: string;
  showDiscountBadge?: boolean;
  showFlashBadge?: boolean;
  showTrendingBadge?: boolean;
  showMallBadge?: boolean;
  showHotDealBadge?: boolean;
  showNewBadge?: boolean;
  sectionLayouts: SectionLayout[];
  
  // Return system controls
  enableReturns?: boolean;
  returnWindowDays?: number;
  allowMindChangeReturns?: boolean;
  requirePhotoUpload?: boolean;
  maxPhotoUploads?: number;
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

  updateSettings: (settings: Partial<any>) => void;
  deleteHeroSlide: (id: string) => void;
  moveSection: (index: number, direction: 'up' | 'down') => void;
  toggleSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<SectionLayout>) => void;
  addSection: (section: SectionLayout) => void;
  deleteSection: (id: string) => void;
  resetSettings: () => void;
}

interface SettingsTabProps {
  siteSettings: SiteSettingsType;
  openAddSlideModal: () => void;
  openEditSlideModal: (slide: HeroSlide) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, folder: string) => void;
  resetMessage: string;
  setResetMessage: (val: string) => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (val: boolean) => void;
}

type UICustomizationSection = 
  | 'homepage'
  | 'deals'
  | 'returns'
  | 'shipping'
  | 'flash_badges'
  | 'store_info'
  | 'backup_reset';

export const SettingsTab: React.FC<SettingsTabProps> = ({
  siteSettings,
  openAddSlideModal,
  openEditSlideModal,
  handleImageUpload,
  resetMessage,
  setResetMessage,
  showResetConfirm,
  setShowResetConfirm,
}) => {
  const [selectedSection, setSelectedSection] = useState<UICustomizationSection>('homepage');
  const [newSecId, setNewSecId] = React.useState('');
  const [newSecName, setNewSecName] = React.useState('');
  const [showAddModal, setShowAddModal] = React.useState(false);

  // List of dropdown options with metadata
  const customizationOptions: {
    id: UICustomizationSection;
    label: string;
    desc: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      id: 'homepage',
      label: 'Homepage & Banners',
      desc: 'Hero slider carousel, small promo banners & section ordering',
      icon: LayoutGrid,
      badge: `${siteSettings.heroSlides?.length || 0} Slides`,
    },
    {
      id: 'deals',
      label: 'Deals & Offers Page',
      desc: 'Special offers showcases, promotional banners & /best-deals layout',
      icon: Flame,
      badge: 'PROMO',
    },
    {
      id: 'returns',
      label: 'Returns Page UI & Policy Rules',
      desc: 'Return form, refund payout methods, unboxing notice & shipping fee rules',
      icon: RotateCcw,
      badge: siteSettings.enableReturns !== false ? 'ACTIVE' : 'OFF',
    },
    {
      id: 'shipping',
      label: 'Delivery Rates & Free Shipping',
      desc: 'Inside & Outside Dhaka courier fees and free shipping threshold',
      icon: Truck,
      badge: `৳${siteSettings.insideDhakaDeliveryFee ?? 60}`,
    },
    {
      id: 'flash_badges',
      label: 'Flash Sale & Product Badges',
      desc: 'Live countdown timer target and product card badge toggles',
      icon: Sparkles,
      badge: 'LIVE',
    },
    {
      id: 'store_info',
      label: 'Store Branding & Helpline',
      desc: 'Marketplace name, announcement bar text, phone, WhatsApp & email',
      icon: Phone,
    },
    {
      id: 'backup_reset',
      label: 'Backup & Factory Reset',
      desc: 'One-click full store JSON export snapshot & restore defaults',
      icon: Database,
    },
  ];

  const currentOption = customizationOptions.find((o) => o.id === selectedSection) || customizationOptions[0];

  return (
    <div className="bg-white rounded-3xl border border-border-color p-4 sm:p-7 shadow-xs space-y-6 font-sans">
      
      {/* 1. MASTER HEADER & DROPDOWN SELECTOR */}
      <div className="pb-5 border-b border-border-color space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Palette className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-text-main tracking-tight">
                {'Storefront & UI Customization Control'}
              </h3>
            </div>
            <p className="text-xs text-text-muted mt-1">
              {'Select a customization target from the dropdown below to manage its layout, banners, settings, and rules.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg text-2xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{'Auto-Save Enabled'}</span>
            </span>
          </div>
        </div>

        {/* PROMINENT CUSTOMIZATION DROPDOWN SELECTOR */}
        <div className="bg-surface-subtle/80 p-3 sm:p-4 rounded-2xl border border-border-color/90 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>{'Select UI Customization Section:'}</span>
            </label>
            <span className="text-2xs font-mono text-text-subtle font-semibold hidden sm:inline">
              {'Switch views instantly'}
            </span>
          </div>

          {/* Interactive Modern Dropdown */}
          <div className="relative">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value as UICustomizationSection)}
              className="w-full h-12 pl-11 pr-10 rounded-xl bg-white border-2 border-primary/30 text-text-main text-xs sm:text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none shadow-xs"
            >
              {customizationOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="py-2 text-text-main font-semibold">
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
              <currentOption.icon className="w-5 h-5" />
            </div>

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION CONTENT CONTAINER */}
      <div className="space-y-6">

        {/* ========================================================================= */}
        {/* OPTION 1: HOMEPAGE & HERO BANNERS */}
        {/* ========================================================================= */}
        {selectedSection === 'homepage' && (
          <HomepageSettings
            siteSettings={siteSettings as any}
            openAddSlideModal={openAddSlideModal}
            openEditSlideModal={openEditSlideModal}
          />
        )}

        {/* ========================================================================= */}
        {/* OPTION 2: DEALS & OFFERS PAGE (/best-deals) */}
        {/* ========================================================================= */}
        {selectedSection === 'deals' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-text-main text-sm flex items-center gap-2">
                  <Flame className="w-4.5 h-4.5 text-primary" />
                  <span>{'Deals & Emporium Showcases Manager (/best-deals)'}</span>
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {'Customize promotional showcases, banner images, discount badges, and featured products on the deals hub.'}
                </p>
              </div>
              <Link
                href="/best-deals"
                target="_blank"
                className="px-3.5 py-1.5 bg-surface-subtle hover:bg-zinc-200 text-text-main rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 border border-border-color cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span>{'View Live Deals Page'}</span>
                <ExternalLink className="w-3 h-3 text-text-subtle" />
              </Link>
            </div>

            <BestDealsTab />
          </div>
        )}

        {/* ========================================================================= */}
        {/* OPTION 3: RETURNS PAGE UI & POLICY RULES */}
        {/* ========================================================================= */}
        {selectedSection === 'returns' && (
          <ReturnSettings siteSettings={siteSettings} />
        )}

        {/* ========================================================================= */}
        {/* OPTION 4: DELIVERY RATES & FREE SHIPPING */}
        {/* ========================================================================= */}
        {selectedSection === 'shipping' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-text-main text-sm flex items-center gap-2">
                  <Truck className="w-4.5 h-4.5 text-primary" />
                  <span>{'Nationwide Delivery Rates & Free Shipping'}</span>
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {'Set shipping fee across Bangladesh, courier deduction fees, and free delivery thresholds.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-subtle border border-border-color/80 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div className="p-4 bg-white rounded-xl border border-border-color shadow-2xs space-y-2">
                  <label className="font-bold text-text-main block">
                    {'Inside Dhaka Delivery Charge (৳)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={siteSettings.insideDhakaDeliveryFee ?? 60}
                      onChange={(e) => siteSettings.updateSettings({ insideDhakaDeliveryFee: Number(e.target.value) })}
                      className="w-full h-11 px-3 bg-white border border-border-color rounded-xl focus:outline-hidden font-bold text-base text-text-main"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-subtle">BDT</span>
                  </div>
                  <p className="text-2xs text-text-subtle">Default: ৳{INSIDE_DHAKA_DELIVERY_FEE_BDT} (Dhaka City)</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-border-color shadow-2xs space-y-2">
                  <label className="font-bold text-text-main block">
                    {'Outside Dhaka Delivery Charge (৳)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={siteSettings.outsideDhakaDeliveryFee ?? 120}
                      onChange={(e) => siteSettings.updateSettings({ outsideDhakaDeliveryFee: Number(e.target.value) })}
                      className="w-full h-11 px-3 bg-white border border-border-color rounded-xl focus:outline-hidden font-bold text-base text-text-main"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-subtle">BDT</span>
                  </div>
                  <p className="text-2xs text-text-subtle">Default: ৳{OUTSIDE_DHAKA_DELIVERY_FEE_BDT} (All districts)</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-border-color shadow-2xs space-y-2">
                  <label className="font-bold text-text-main block">
                    {'Free Shipping Spend Threshold (৳)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={siteSettings.freeShippingThreshold ?? 3000}
                      onChange={(e) => siteSettings.updateSettings({ freeShippingThreshold: Number(e.target.value) })}
                      className="w-full h-11 px-3 bg-white border border-border-color rounded-xl focus:outline-hidden font-bold text-base text-emerald-700"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">BDT</span>
                  </div>
                  <p className="text-2xs text-text-subtle">Orders above this qualify for free delivery</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OPTION 5: FLASH SALE & PRODUCT CARD BADGES */}
        {/* ========================================================================= */}
        {selectedSection === 'flash_badges' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-text-main text-sm flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-primary" />
                  <span>{'Flash Sale Campaign & Product Badges'}</span>
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {'Set timer, banners, and promotional badges on product cards.'}
                </p>
              </div>
            </div>

            {/* Flash Sale Countdown Timer Settings */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
              <div className="pb-2 border-b border-amber-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <h5 className="font-bold text-text-main text-xs uppercase tracking-wider">
                  {'⚡ Flash Sale Countdown & Titles'}
                </h5>
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs font-sans">
                <div>
                  <label className="font-bold text-text-main block mb-1">{'Flash Sale Title'}</label>
                  <input
                    type="text"
                    value={siteSettings.flashSaleTitle || 'FLASH SALE'}
                    onChange={(e) => siteSettings.updateSettings({ flashSaleTitle: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-color rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">{'Flash Sale Subtitle'}</label>
                  <input
                    type="text"
                    value={siteSettings.flashSaleSubtitle || 'Up to 50% Off Limited Time Deals'}
                    onChange={(e) => siteSettings.updateSettings({ flashSaleSubtitle: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-color rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">{'Flash Sale Target End Date & Time'}</label>
                  <input
                    type="datetime-local"
                    value={siteSettings.flashSaleEndTime ? siteSettings.flashSaleEndTime.slice(0, 16) : '2026-10-01T23:59'}
                    onChange={(e) => siteSettings.updateSettings({ flashSaleEndTime: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-border-color rounded-xl font-bold text-primary"
                  />
                </div>
              </div>
            </div>

            {/* Product Card Badges Control */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-color/80 space-y-4">
              <div className="pb-2 border-b border-border-color flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <h5 className="font-bold text-text-main text-xs uppercase tracking-wider">
                  {'🏷️ Product Card Badges Control Panel'}
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <label className="flex items-center gap-2.5 p-3 bg-white border border-border-color rounded-xl cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={siteSettings.showDiscountBadge ?? true}
                    onChange={(e) => siteSettings.updateSettings({ showDiscountBadge: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-main block">{'Discount Percentage'}</span>
                    <span className="text-2xs text-text-muted block">{'e.g. -28% off badge'}</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-white border border-border-color rounded-xl cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={siteSettings.showFlashBadge ?? true}
                    onChange={(e) => siteSettings.updateSettings({ showFlashBadge: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-main block">{'Flash Deals (FLASH)'}</span>
                    <span className="text-2xs text-text-muted block">{'e.g. FLASH orange badge'}</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-white border border-border-color rounded-xl cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={siteSettings.showTrendingBadge ?? true}
                    onChange={(e) => siteSettings.updateSettings({ showTrendingBadge: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-main block">{'Trending (TRENDING)'}</span>
                    <span className="text-2xs text-text-muted block">{'e.g. 🔥 TRENDING badge'}</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-white border border-border-color rounded-xl cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={siteSettings.showMallBadge ?? true}
                    onChange={(e) => siteSettings.updateSettings({ showMallBadge: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-main block">{'Official Mall (MALL)'}</span>
                    <span className="text-2xs text-text-muted block">{'e.g. 🏢 MALL blue badge'}</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-white border border-border-color rounded-xl cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={siteSettings.showHotDealBadge ?? true}
                    onChange={(e) => siteSettings.updateSettings({ showHotDealBadge: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-main block">{'Hot Deal (HOT DEAL)'}</span>
                    <span className="text-2xs text-text-muted block">{'e.g. 🏷️ HOT DEAL badge'}</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-white border border-border-color rounded-xl cursor-pointer hover:bg-surface-subtle/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={siteSettings.showNewBadge ?? true}
                    onChange={(e) => siteSettings.updateSettings({ showNewBadge: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-main block">{'New Arrivals (NEW)'}</span>
                    <span className="text-2xs text-text-muted block">{'e.g. ✨ NEW badge'}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OPTION 6: STORE INFO & CONTACTS */}
        {/* ========================================================================= */}
        {selectedSection === 'store_info' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-text-main text-sm flex items-center gap-2">
                  <Phone className="w-4.5 h-4.5 text-primary" />
                  <span>{'Store Branding & Helpline Info'}</span>
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {'Customize store name, announcements, customer support helpline, and inventory alert limits.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-subtle border border-border-color/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="font-bold text-text-muted block mb-1.5">Marketplace Name</label>
                  <input
                    type="text"
                    value={siteSettings.appName}
                    onChange={(e) => siteSettings.updateSettings({ appName: e.target.value })}
                    className="w-full h-10 px-3.5 bg-white border border-border-color rounded-xl text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-text-muted block mb-1.5">Announcement Bar Text</label>
                  <input
                    type="text"
                    value={siteSettings.announcementText}
                    onChange={(e) => siteSettings.updateSettings({ announcementText: e.target.value })}
                    className="w-full h-10 px-3.5 bg-white border border-border-color rounded-xl text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-text-muted block mb-1.5">Helpline Phone Number</label>
                  <input
                    type="text"
                    value={siteSettings.supportPhone}
                    onChange={(e) => siteSettings.updateSettings({ supportPhone: e.target.value })}
                    className="w-full h-10 px-3.5 bg-white border border-border-color rounded-xl text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-text-muted block mb-1.5">WhatsApp Support Number</label>
                  <input
                    type="text"
                    value={siteSettings.whatsappNumber ?? '+8801700000000'}
                    onChange={(e) => siteSettings.updateSettings({ whatsappNumber: e.target.value })}
                    className="w-full h-10 px-3.5 bg-white border border-border-color rounded-xl text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-text-muted block mb-1.5">Support Email Address</label>
                  <input
                    type="email"
                    value={siteSettings.supportEmail}
                    onChange={(e) => siteSettings.updateSettings({ supportEmail: e.target.value })}
                    className="w-full h-10 px-3.5 bg-white border border-border-color rounded-xl text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-text-muted block mb-1.5">Low Stock Warning Threshold (Units)</label>
                  <input
                    type="number"
                    min={1}
                    value={siteSettings.lowStockThreshold}
                    onChange={(e) => siteSettings.updateSettings({ lowStockThreshold: Number(e.target.value) })}
                    className="w-full h-10 px-3.5 bg-white border border-border-color rounded-xl text-xs sm:text-sm font-bold text-amber-700"
                  />
                  <p className="text-2xs text-text-subtle mt-1">Products at or below this count trigger low stock warnings.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OPTION 7: BACKUP & SYSTEM MAINTENANCE */}
        {/* ========================================================================= */}
        {selectedSection === 'backup_reset' && (
          <BackupResetSettings
            siteSettings={siteSettings}
            resetMessage={resetMessage}
            setResetMessage={setResetMessage}
            showResetConfirm={showResetConfirm}
            setShowResetConfirm={setShowResetConfirm}
          />
        )}
      </div>
    </div>
  );
};
