'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  LayoutGrid, 
  Plus, 
  Sliders, 
  RotateCcw,
  Package,
  Gift,
  Trash2,
  Check,
  Edit2
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';
import { useProductStore } from '@/store/useProductStore';

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
  name?: string;
  nameEn?: string;
  enabled: boolean;
  customTitle?: string;
  customSubtitle?: string;
  preset: string;
}

interface HomepageSettingsProps {
  siteSettings: {
    heroSlides: HeroSlide[];
    smallBanner1?: SmallBanner;
    smallBanner2?: SmallBanner;
    sectionLayouts: SectionLayout[];
    combos: any[];
    b1g1Offers: any[];
    updateSettings: (fields: any) => void;
    moveSection: (idx: number, dir: 'up' | 'down') => void;
    toggleSection: (id: string) => void;
    deleteSection: (id: string) => void;
    addSection?: (section: any) => void;
    updateSection: (id: string, fields: any) => void;
    deleteHeroSlide: (id: string) => void;
    addCombo: (combo: any) => void;
    updateCombo: (id: string, combo: any) => void;
    deleteCombo: (id: string) => void;
    toggleCombo: (id: string) => void;
    addB1G1Offer: (offer: any) => void;
    updateB1G1Offer: (id: string, offer: any) => void;
    deleteB1G1Offer: (id: string) => void;
    toggleB1G1Offer: (id: string) => void;
  };
  openAddSlideModal: () => void;
  openEditSlideModal: (slide: HeroSlide) => void;
}

const SECTION_NAMES: Record<string, string> = {
  hero: 'Hero Banner Slider',
  categories: 'Shop by Category',
  combo_products: 'Combo Products & Bundles',
  buy1_get1: 'Buy 1 Get 1 Free Offers',
  flash_deals: 'Flash Deals Countdown',
  daily_deals: 'Daily Deals Countdown',
  budget_deals: 'Budget Deals Zone',
  vouchers: 'Voucher & Coupon Hub',
  trending_picks: 'Trending & Recommended Picks',
  new_arrivals: 'New Arrivals Catalog',
  brand_mall: 'Official Brand Mall',
  reviews: 'Customer Reviews & Ratings',
  app_download: 'Promo App & Welcome Banner',
};

export const HomepageSettings: React.FC<HomepageSettingsProps> = ({
  siteSettings,
  openAddSlideModal,
  openEditSlideModal,
}) => {
  const { products } = useProductStore();

  // Combo modal / inline state
  const [showComboForm, setShowComboForm] = useState(false);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);
  const [comboTitle, setComboTitle] = useState('');
  const [comboSubtitle, setComboSubtitle] = useState('');
  const [comboBadge, setComboBadge] = useState('COMBO SAVINGS');
  const [comboPrice, setComboPrice] = useState(3000);
  const [comboOriginalPrice, setComboOriginalPrice] = useState(4500);
  const [selectedProd1, setSelectedProd1] = useState(products[0]?.id || '');
  const [selectedProd2, setSelectedProd2] = useState(products[1]?.id || '');

  // B1G1 modal / inline state
  const [showB1G1Form, setShowB1G1Form] = useState(false);
  const [editingB1G1Id, setEditingB1G1Id] = useState<string | null>(null);
  const [b1g1Title, setB1G1Title] = useState('');
  const [b1g1Subtitle, setB1G1Subtitle] = useState('');
  const [b1g1Badge, setB1G1Badge] = useState('BUY 1 GET 1 FREE');
  const [buyProdId, setBuyProdId] = useState(products[0]?.id || '');
  const [getProdId, setGetProdId] = useState(products[1]?.id || '');

  const handleSaveCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboTitle.trim() || !selectedProd1 || !selectedProd2) return;

    const payload = {
      title: comboTitle.trim(),
      subtitle: comboSubtitle.trim(),
      badge: comboBadge.trim(),
      comboPrice: Number(comboPrice),
      originalPrice: Number(comboOriginalPrice),
      items: [
        { productId: selectedProd1, quantity: 1 },
        { productId: selectedProd2, quantity: 1 },
      ],
    };

    if (editingComboId) {
      siteSettings.updateCombo(editingComboId, payload);
    } else {
      siteSettings.addCombo({
        ...payload,
        enabled: true,
      });
    }

    setShowComboForm(false);
    setEditingComboId(null);
    setComboTitle('');
    setComboSubtitle('');
  };

  const handleEditCombo = (c: any) => {
    setEditingComboId(c.id);
    setComboTitle(c.title);
    setComboSubtitle(c.subtitle || '');
    setComboBadge(c.badge || 'COMBO SAVINGS');
    setComboPrice(c.comboPrice);
    setComboOriginalPrice(c.originalPrice || c.comboPrice + 1000);
    setSelectedProd1(c.items?.[0]?.productId || products[0]?.id || '');
    setSelectedProd2(c.items?.[1]?.productId || products[1]?.id || '');
    setShowComboForm(true);
  };

  const handleSaveB1G1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b1g1Title.trim() || !buyProdId || !getProdId) return;

    const payload = {
      title: b1g1Title.trim(),
      subtitle: b1g1Subtitle.trim(),
      badge: b1g1Badge.trim(),
      buyProductId: buyProdId,
      buyQuantity: 1,
      getProductId: getProdId,
      getQuantity: 1,
    };

    if (editingB1G1Id) {
      siteSettings.updateB1G1Offer(editingB1G1Id, payload);
    } else {
      siteSettings.addB1G1Offer({
        ...payload,
        enabled: true,
      });
    }

    setShowB1G1Form(false);
    setEditingB1G1Id(null);
    setB1G1Title('');
    setB1G1Subtitle('');
  };

  const handleEditB1G1 = (o: any) => {
    setEditingB1G1Id(o.id);
    setB1G1Title(o.title);
    setB1G1Subtitle(o.subtitle || '');
    setB1G1Badge(o.badge || 'BUY 1 GET 1 FREE');
    setBuyProdId(o.buyProductId);
    setGetProdId(o.getProductId);
    setShowB1G1Form(true);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Sub-Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
        <div>
          <h4 className="font-bold text-text-main text-sm flex items-center gap-2">
            <LayoutGrid className="w-4.5 h-4.5 text-primary" />
            <span>{'Homepage Carousel, Sections & Promotional Merchandising'}</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            {'Manage carousel slides, section layouts, Combo Products, and Buy 1 Get 1 Free offers.'}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddSlideModal}
          className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{'Add New Hero Slide'}</span>
        </button>
      </div>

      {/* Hero Slides Grid */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-color/80 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border-color">
          <span className="text-2xs font-extrabold uppercase text-text-muted tracking-wider">
            {`Active Slides (${(siteSettings.heroSlides || []).length})`}
          </span>
          <span className="text-2xs text-text-subtle font-mono">1400x600px Recommended</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(siteSettings.heroSlides || []).map((slide, idx) => (
            <div key={slide.id} className="p-3 bg-white rounded-xl border border-border-color flex gap-3 items-center group shadow-2xs">
              <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border-color shrink-0 bg-surface-subtle">
                <Image 
                  src={slide.image} 
                  alt={slide.titleEn || "Homepage hero slide banner"} 
                  fill 
                  sizes="80px" 
                  className="object-cover" 
                  referrerPolicy="no-referrer" 
                />
                <span className="absolute top-1 left-1 bg-black/70 text-white text-2xs font-mono px-1 rounded">
                  #{idx + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {slide.badgeEn}
                  </span>
                </div>
                <div className="font-bold text-xs text-text-main truncate mt-0.5" title={slide.titleEn}>
                  {slide.titleEn}
                </div>
                <div className="text-2xs text-text-muted truncate" title={slide.subtitleEn}>
                  {slide.subtitleEn}
                </div>
                <div className="text-2xs font-mono text-text-subtle truncate">
                  Link: {slide.buttonLink}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditSlideModal(slide)}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit Slide"
                >
                  <Sliders className="w-3.5 h-3.5 text-text-muted" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if ((siteSettings.heroSlides || []).length > 1) {
                      siteSettings.deleteHeroSlide(slide.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Slide"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Small Promo Banners (2 Slots) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-border-color/80 space-y-4">
        <div className="pb-2 border-b border-border-color">
          <h5 className="font-bold text-text-main text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            <span>{'Homepage Secondary Promo Banners (Total 2)'}</span>
          </h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Banner 1 */}
          <div className="p-4 bg-white rounded-xl border border-border-color space-y-3 shadow-2xs">
            <span className="text-2xs font-extrabold uppercase text-primary tracking-wide block">
              {'Promo Banner 1'}
            </span>
            <div className="space-y-2 text-2xs font-semibold text-text-muted">
              <div>
                <label className="block mb-1">{'Title'}</label>
                <input
                  type="text"
                  value={siteSettings.smallBanner1?.titleEn ?? 'Festive Attire'}
                  onChange={(e) => siteSettings.updateSettings({
                    smallBanner1: { ...(siteSettings.smallBanner1 ?? {
                      titleEn: 'Festive Attire',
                      badgeEn: '40% OFF',
                      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
                      link: '/shop?category=Men%27s+Fashion',
                    }), titleEn: e.target.value }
                  })}
                  className="w-full h-8.5 px-2.5 bg-white border border-border-color rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Banner 2 */}
          <div className="p-4 bg-white rounded-xl border border-border-color space-y-3 shadow-2xs">
            <span className="text-2xs font-extrabold uppercase text-primary tracking-wide block">
              {'Promo Banner 2'}
            </span>
            <div className="space-y-2 text-2xs font-semibold text-text-muted">
              <div>
                <label className="block mb-1">{'Title'}</label>
                <input
                  type="text"
                  value={siteSettings.smallBanner2?.titleEn ?? 'Smart Gear'}
                  onChange={(e) => siteSettings.updateSettings({
                    smallBanner2: { ...(siteSettings.smallBanner2 ?? {
                      titleEn: 'Smart Gear',
                      badgeEn: '৳999+',
                      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
                      link: '/shop?category=Electronics+%26+Gadgets',
                    }), titleEn: e.target.value }
                  })}
                  className="w-full h-8.5 px-2.5 bg-white border border-border-color rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMBO PRODUCTS MANAGEMENT PANEL */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-border-color shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
          <div>
            <h5 className="font-bold text-text-main text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span>{'Combo Products & Bundle Offers Admin HQ'}</span>
            </h5>
            <p className="text-2xs text-text-muted mt-0.5">
              {'Configure product bundles, set custom bundle prices, and manage active combo deals.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingComboId(null);
              setComboTitle('');
              setComboSubtitle('');
              setComboBadge('MEGA SAVINGS BUNDLE');
              setComboPrice(3500);
              setComboOriginalPrice(5000);
              setShowComboForm(true);
            }}
            className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{'Create New Combo Bundle'}</span>
          </button>
        </div>

        {/* Combo Form */}
        {showComboForm && (
          <form onSubmit={handleSaveCombo} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
            <h6 className="text-xs font-extrabold uppercase text-primary">
              {editingComboId ? 'Edit Combo Bundle' : 'Create New Combo Bundle'}
            </h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-2xs font-bold mb-1">Bundle Title *</label>
                <input
                  type="text"
                  required
                  value={comboTitle}
                  onChange={(e) => setComboTitle(e.target.value)}
                  placeholder="E.g. Festive Attire & Smartwatch Bundle"
                  className="w-full h-8.5 px-2.5 bg-white border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-2xs font-bold mb-1">Bundle Subtitle</label>
                <input
                  type="text"
                  value={comboSubtitle}
                  onChange={(e) => setComboSubtitle(e.target.value)}
                  placeholder="E.g. Designer Panjabi + Analog Watch"
                  className="w-full h-8.5 px-2.5 bg-white border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-2xs font-bold mb-1">Select First Product *</label>
                <select
                  value={selectedProd1}
                  onChange={(e) => setSelectedProd1(e.target.value)}
                  className="w-full h-8.5 px-2 bg-white border border-zinc-200 rounded-lg"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-2xs font-bold mb-1">Select Second Product *</label>
                <select
                  value={selectedProd2}
                  onChange={(e) => setSelectedProd2(e.target.value)}
                  className="w-full h-8.5 px-2 bg-white border border-zinc-200 rounded-lg"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-2xs font-bold mb-1">Combo Bundle Price (৳) *</label>
                <input
                  type="number"
                  required
                  value={comboPrice}
                  onChange={(e) => setComboPrice(Number(e.target.value))}
                  className="w-full h-8.5 px-2.5 bg-white border border-zinc-200 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-2xs font-bold mb-1">Original Price (৳)</label>
                <input
                  type="number"
                  value={comboOriginalPrice}
                  onChange={(e) => setComboOriginalPrice(Number(e.target.value))}
                  className="w-full h-8.5 px-2.5 bg-white border border-zinc-200 rounded-lg font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowComboForm(false)}
                className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold"
              >
                Save Combo Bundle
              </button>
            </div>
          </form>
        )}

        {/* Existing Combos List */}
        <div className="space-y-2">
          {(siteSettings.combos || []).map((c) => (
            <div key={c.id} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-zinc-900 truncate">{c.title}</span>
                  {c.enabled ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-2xs font-black">ACTIVE</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-600 text-2xs font-bold">DISABLED</span>
                  )}
                </div>
                <div className="text-2xs text-zinc-500 font-mono mt-0.5">
                  Bundle Price: <b className="text-primary font-bold">৳{c.comboPrice}</b> | Original: ৳{c.originalPrice || 0}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => siteSettings.toggleCombo(c.id)}
                  className="px-2 py-1 text-2xs font-bold bg-white border border-zinc-200 rounded-md cursor-pointer"
                >
                  {c.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => handleEditCombo(c)}
                  className="p-1.5 text-zinc-600 hover:bg-zinc-200 rounded-md cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => siteSettings.deleteCombo(c.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BUY 1 GET 1 OFFERS MANAGEMENT PANEL */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-border-color shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
          <div>
            <h5 className="font-bold text-text-main text-sm flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>{'Buy 1 Get 1 FREE Offers Admin HQ'}</span>
            </h5>
            <p className="text-2xs text-text-muted mt-0.5">
              {'Pair qualifying buy items with 100% FREE bonus items for instant cart application.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingB1G1Id(null);
              setB1G1Title('');
              setB1G1Subtitle('');
              setB1G1Badge('BUY 1 GET 1 FREE');
              setShowB1G1Form(true);
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{'Create B1G1 Offer'}</span>
          </button>
        </div>

        {/* B1G1 Form */}
        {showB1G1Form && (
          <form onSubmit={handleSaveB1G1} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
            <h6 className="text-xs font-extrabold uppercase text-amber-800">
              {editingB1G1Id ? 'Edit B1G1 Offer' : 'Create New B1G1 Offer'}
            </h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-2xs font-bold mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={b1g1Title}
                  onChange={(e) => setB1G1Title(e.target.value)}
                  placeholder="E.g. Buy Leather Wallet, Get Flask FREE"
                  className="w-full h-8.5 px-2.5 bg-white border border-amber-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-2xs font-bold mb-1">Offer Subtitle</label>
                <input
                  type="text"
                  value={b1g1Subtitle}
                  onChange={(e) => setB1G1Subtitle(e.target.value)}
                  placeholder="E.g. Receive a 500ml Stainless Flask for FREE!"
                  className="w-full h-8.5 px-2.5 bg-white border border-amber-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-2xs font-bold mb-1">Select Qualifying Product (BUY THIS) *</label>
                <select
                  value={buyProdId}
                  onChange={(e) => setBuyProdId(e.target.value)}
                  className="w-full h-8.5 px-2 bg-white border border-amber-200 rounded-lg"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-2xs font-bold mb-1">Select Bonus Product (GET THIS FREE) *</label>
                <select
                  value={getProdId}
                  onChange={(e) => setGetProdId(e.target.value)}
                  className="w-full h-8.5 px-2 bg-white border border-amber-200 rounded-lg"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (FREE)</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowB1G1Form(false)}
                className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold"
              >
                Save B1G1 Offer
              </button>
            </div>
          </form>
        )}

        {/* Existing B1G1 List */}
        <div className="space-y-2">
          {(siteSettings.b1g1Offers || []).map((o) => (
            <div key={o.id} className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-zinc-900 truncate">{o.title}</span>
                  {o.enabled ? (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-2xs font-black">ACTIVE</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-600 text-2xs font-bold">DISABLED</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => siteSettings.toggleB1G1Offer(o.id)}
                  className="px-2 py-1 text-2xs font-bold bg-white border border-zinc-200 rounded-md cursor-pointer"
                >
                  {o.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => handleEditB1G1(o)}
                  className="p-1.5 text-zinc-600 hover:bg-zinc-200 rounded-md cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => siteSettings.deleteB1G1Offer(o.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Homepage Section Live Control Center */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h5 className="font-bold text-text-main text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span>{'Homepage Sections Reorder & Toggle Center'}</span>
            </h5>
            <p className="text-2xs text-text-muted mt-0.5">
              {'Move sections Up/Down, enable/disable, and provide custom titles.'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {(siteSettings.sectionLayouts && siteSettings.sectionLayouts.length > 0
            ? siteSettings.sectionLayouts
            : []
          ).map((sec, idx) => {
            const sectionName = SECTION_NAMES[sec.id] || sec.id;

            return (
              <div
                key={sec.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  sec.enabled
                    ? 'bg-white border-border-color shadow-3xs'
                    : 'bg-surface-subtle border-border-color opacity-60'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6.5 h-6.5 rounded-lg bg-surface-subtle text-text-muted text-xs font-bold flex items-center justify-center shrink-0 border border-border-color">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-text-main">
                          {sectionName}
                        </span>
                        {sec.enabled ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-2xs font-extrabold uppercase">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-muted border border-border-color text-2xs font-bold uppercase">
                            HIDDEN
                          </span>
                        )}
                      </div>
                      <p className="text-2xs text-text-subtle font-mono mt-0.5">
                        ID: {sec.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => siteSettings.moveSection(idx, 'up')}
                      className="px-2 py-1 bg-surface-subtle hover:bg-zinc-200 disabled:opacity-30 text-text-muted rounded-lg text-xs font-semibold cursor-pointer border border-border-color"
                    >
                      ▲ Up
                    </button>
                    <button
                      type="button"
                      disabled={idx === (siteSettings.sectionLayouts?.length || 10) - 1}
                      onClick={() => siteSettings.moveSection(idx, 'down')}
                      className="px-2 py-1 bg-surface-subtle hover:bg-zinc-200 disabled:opacity-30 text-text-muted rounded-lg text-xs font-semibold cursor-pointer border border-border-color"
                    >
                      ▼ Down
                    </button>

                    <label className="relative inline-flex items-center cursor-pointer ml-1">
                      <input
                        type="checkbox"
                        checked={sec.enabled}
                        onChange={() => siteSettings.toggleSection(sec.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-hover after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>

                    <button
                      type="button"
                      onClick={() => siteSettings.deleteSection(sec.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer ml-1"
                      title="Delete Section"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {sec.enabled && (
                  <div className="mt-2.5 pt-2.5 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-2xs font-semibold text-text-muted block mb-1">Custom Title</label>
                      <input
                        type="text"
                        value={sec.customTitle || ''}
                        onChange={(e) => siteSettings.updateSection(sec.id, { customTitle: e.target.value })}
                        placeholder={sectionName}
                        className="w-full h-8.5 px-2.5 bg-white border border-border-color rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-2xs font-semibold text-text-muted block mb-1">Custom Subtitle</label>
                      <input
                        type="text"
                        value={sec.customSubtitle || ''}
                        onChange={(e) => siteSettings.updateSection(sec.id, { customSubtitle: e.target.value })}
                        placeholder="Optional subtitle description"
                        className="w-full h-8.5 px-2.5 bg-white border border-border-color rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
