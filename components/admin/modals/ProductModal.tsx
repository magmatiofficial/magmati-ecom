'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  Upload, 
  Sparkles, 
  Film, 
  Image as ImageIcon, 
  Play, 
  ArrowUp, 
  ArrowDown, 
  Star, 
  Trash2, 
  Plus, 
  HelpCircle,
  Video,
  Sliders,
  Loader2,
  Wand2
} from 'lucide-react';
import { Product, ProductMediaItem, ProductMediaType } from '@/types';
import { detectMediaType, getYouTubeEmbedUrl, getVimeoEmbedUrl } from '@/lib/mediaUtils';
import { useBestDealsStore } from '@/store/useBestDealsStore';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  
  prodName: string;
  setProdName: (v: string) => void;
  
  prodSku: string;
  setProdSku: (v: string) => void;
  prodCategory: string;
  setProdCategory: (v: string) => void;
  prodSubcategory: string;
  setProdSubcategory: (v: string) => void;
  prodPrice: number;
  setProdPrice: (v: number) => void;
  prodOriginalPrice?: number;
  setProdOriginalPrice: (v: number | undefined) => void;
  prodImages: string[];
  setProdImages: (v: string[]) => void;
  prodMedia?: ProductMediaItem[];
  setProdMedia?: React.Dispatch<React.SetStateAction<ProductMediaItem[]>>;
  prodPreviewGifUrl?: string;
  setProdPreviewGifUrl?: (v: string) => void;
  prodVideoUrl?: string;
  setProdVideoUrl?: (v: string) => void;
  prodMainImageIndex?: number;
  setProdMainImageIndex?: (v: number) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void, folder?: string) => void;
  handleMediaUpload?: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string, type: ProductMediaType) => void, folder?: string) => void;
  prodDescription: string;
  setProdDescription: (v: string) => void;
  
  prodInStock: boolean;
  setProdInStock: (v: boolean) => void;
  prodStockQuantity: number;
  setProdStockQuantity: (v: number) => void;
  prodLowStockThreshold?: number;
  setProdLowStockThreshold: (v: number | undefined) => void;
  siteSettings?: { lowStockThreshold?: number };
  prodIsFlashDeal: boolean;
  setProdIsFlashDeal: (v: boolean) => void;
  prodIsBestDeal: boolean;
  setProdIsBestDeal: (v: boolean) => void;
  prodIsNew: boolean;
  setProdIsNew: (v: boolean) => void;
  prodIsBrandMall: boolean;
  setProdIsBrandMall: (v: boolean) => void;
  prodIsTrending: boolean;
  setProdIsTrending: (v: boolean) => void;
  prodShowDiscountBadge: boolean;
  setProdShowDiscountBadge: (v: boolean) => void;
  prodShowFlashBadge: boolean;
  setProdShowFlashBadge: (v: boolean) => void;
  prodShowTrendingBadge: boolean;
  setProdShowTrendingBadge: (v: boolean) => void;
  prodShowMallBadge: boolean;
  setProdShowMallBadge: (v: boolean) => void;
  prodShowHotDealBadge: boolean;
  setProdShowHotDealBadge: (v: boolean) => void;
  prodShowNewBadge: boolean;
  setProdShowNewBadge: (v: boolean) => void;
  prodAllowedPaymentMethods?: any;
  setProdAllowedPaymentMethods?: any;
  allowedPaymentMethods?: ('cod' | 'bkash' | 'nagad' | 'card')[];
  setAllowedPaymentMethods?: (v: ('cod' | 'bkash' | 'nagad' | 'card')[]) => void;
  prodBestDealSectionId?: string;
  setProdBestDealSectionId?: (v: string) => void;
  prodBrand?: string;
  setProdBrand?: (v: string) => void;
  prodSizes?: string | string[];
  setProdSizes?: (v: any) => void;
  onSubmit?: (e: React.FormEvent) => void;
  handleSubmit?: (e: React.FormEvent) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  prodName,
  setProdName,
  prodSku,
  setProdSku,
  prodCategory,
  setProdCategory,
  prodSubcategory,
  setProdSubcategory,
  prodPrice,
  setProdPrice,
  prodOriginalPrice,
  setProdOriginalPrice,
  prodImages,
  setProdImages,
  prodMedia = [],
  setProdMedia,
  prodPreviewGifUrl = '',
  setProdPreviewGifUrl,
  prodVideoUrl = '',
  setProdVideoUrl,
  handleImageUpload,
  handleMediaUpload,
  prodDescription,
  setProdDescription,
  prodInStock,
  setProdInStock,
  prodStockQuantity,
  setProdStockQuantity,
  prodLowStockThreshold,
  setProdLowStockThreshold,
  siteSettings = { lowStockThreshold: 5 },
  prodIsFlashDeal,
  setProdIsFlashDeal,
  prodIsBestDeal,
  setProdIsBestDeal,
  prodIsNew,
  setProdIsNew,
  prodIsBrandMall,
  setProdIsBrandMall,
  prodIsTrending,
  setProdIsTrending,
  prodShowDiscountBadge,
  setProdShowDiscountBadge,
  prodShowFlashBadge,
  setProdShowFlashBadge,
  prodShowTrendingBadge,
  setProdShowTrendingBadge,
  prodShowMallBadge,
  setProdShowMallBadge,
  prodShowHotDealBadge,
  setProdShowHotDealBadge,
  prodShowNewBadge,
  setProdShowNewBadge,
  allowedPaymentMethods = ['cod', 'bkash', 'nagad', 'card'],
  setAllowedPaymentMethods,
  prodBestDealSectionId = '',
  setProdBestDealSectionId,
  onSubmit,
  handleSubmit,
}) => {
  const { sections: bestDealSections } = useBestDealsStore();
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [modalError, setModalError] = useState('');

  const handleAiGenerateDescription = async () => {
    if (!prodName) {
      setModalError('Please enter Product Name first!');
      return;
    }

    setIsAiGenerating(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = await auth.currentUser?.getIdToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const currentUser = useAuthStore.getState().currentUser;
      if (currentUser?.role === 'admin' && currentUser.email) headers['x-admin-email'] = currentUser.email;

      const res = await fetch('/api/admin/gemini-generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productName: prodName,
          category: prodCategory || 'Fashion',
          prompt: `Write an engaging product description for "${prodName}" in category "${prodCategory}". Return JSON: {"description": "..."}`
        }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        try {
          const jsonMatch = data.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.description) setProdDescription(parsed.description);
          } else {
            setProdDescription(data.text);
          }
        } catch {
          setProdDescription(data.text);
        }
      } else {
        setModalError(data.error || 'Gemini API call failed. Please check GEMINI_API_KEY in .env config.');
      }
    } catch (err: any) {
      setModalError('AI Generation error: ' + err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  if (!isOpen) return null;

  // Media Reordering Handlers
  const moveMediaUp = (idx: number) => {
    if (!setProdMedia || idx <= 0) return;
    setProdMedia((prev) => {
      const next = [...prev];
      const temp = next[idx - 1];
      next[idx - 1] = next[idx];
      next[idx] = temp;
      return next;
    });
  };

  const moveMediaDown = (idx: number) => {
    if (!setProdMedia || idx >= prodMedia.length - 1) return;
    setProdMedia((prev) => {
      const next = [...prev];
      const temp = next[idx + 1];
      next[idx + 1] = next[idx];
      next[idx] = temp;
      return next;
    });
  };

  const setAsCover = (idx: number) => {
    if (!setProdMedia || idx === 0) return;
    setProdMedia((prev) => {
      const next = [...prev];
      const selected = next.splice(idx, 1)[0];
      next.unshift(selected);
      return next;
    });
  };

  const removeMedia = (idx: number) => {
    if (!setProdMedia) return;
    setProdMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const addMediaRow = (type: ProductMediaType = 'image') => {
    if (!setProdMedia) return;
    setProdMedia((prev) => [
      ...prev,
      {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        url: '',
        title: '',
      },
    ]);
  };

  const updateMediaRow = (idx: number, patch: Partial<ProductMediaItem>) => {
    if (!setProdMedia) return;
    setProdMedia((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect type from file
    let detectedType: ProductMediaType = 'image';
    if (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm')) {
      detectedType = 'video';
    } else if (file.type === 'image/gif' || file.name.endsWith('.gif')) {
      detectedType = 'gif';
    }

    if (handleMediaUpload) {
      handleMediaUpload(e, (url, type) => {
        updateMediaRow(idx, { url, type });
      });
    } else {
      handleImageUpload(e, (url) => {
        updateMediaRow(idx, { url, type: detectedType });
      }, 'products');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[120] p-3 sm:p-4 font-sans animate-fade-in custom-scrollbar">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85dvh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar border border-zinc-200 shadow-2xl p-4 sm:p-6 md:p-8 space-y-6 relative animate-scale-up my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h3 className="font-sans text-lg sm:text-xl font-bold text-zinc-900">
            {editingProduct 
              ? ('Edit Product & Multi-Media Suite') 
              : ('Launch New Product & Media Gallery')}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {'Add images, animated GIFs, in-app playable videos, and adjust exact display ordering.'}
          </p>
        </div>

        {modalError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <span className="leading-normal">{modalError}</span>
            <button
              type="button"
              onClick={() => setModalError('')}
              className="text-red-700 hover:text-red-950 font-bold text-xs cursor-pointer p-0.5 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={onSubmit || handleSubmit} className="space-y-5 text-xs font-sans">
          {/* General Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="e.g. Royal Indigo Premium Silk Panjabi"
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={prodSku}
                onChange={(e) => setProdSku(e.target.value)}
                placeholder="MGM-PJ-ROYAL"
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Marketplace Category *</label>
              <select
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden"
              >
                <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                <option value="Men's Fashion">Men&apos;s Fashion</option>
                <option value="Women's Fashion">Women&apos;s Fashion</option>
                <option value="Kids & Baby Care">Kids & Baby Care</option>
                <option value="Home & Kitchen Appliances">Home & Kitchen Appliances</option>
                <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                <option value="Footwear & Leather">Footwear & Leather</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Subcategory *</label>
              <input
                type="text"
                required
                value={prodSubcategory}
                onChange={(e) => setProdSubcategory(e.target.value)}
                placeholder="e.g. Panjabi, Kurti, Smartwatches"
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Retail Price (BDT ৳) *</label>
              <input
                type="number"
                required
                value={prodPrice}
                onChange={(e) => setProdPrice(Number(e.target.value))}
                placeholder="e.g. 4850"
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Original Price (Strikeout ৳)</label>
              <input
                type="number"
                value={prodOriginalPrice || ''}
                onChange={(e) => setProdOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 6000"
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>

          {/* =========================================================================
           * ADVANCED RICH MEDIA GALLERY MANAGER (IMAGES, GIFS, IN-APP VIDEOS & REORDERING)
           * ========================================================================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Film className="w-4 h-4 text-primary" />
                  <span>{'Product Media Gallery & Sequence'}</span>
                </h4>
                <p className="text-2xs text-zinc-500 mt-0.5">
                  {'Reorder items, set primary cover (#1), add animated GIFs, and integrate in-app playable videos.'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => addMediaRow('image')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-primary text-zinc-800 text-2xs font-bold flex items-center gap-1 shadow-2xs hover:text-primary cursor-pointer"
                >
                  <ImageIcon className="w-3 h-3 text-sky-600" />
                  <span>+ Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => addMediaRow('gif')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-purple-600 text-zinc-800 text-2xs font-bold flex items-center gap-1 shadow-2xs hover:text-purple-600 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>+ GIF</span>
                </button>
                <button
                  type="button"
                  onClick={() => addMediaRow('video')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-red-600 text-zinc-800 text-2xs font-bold flex items-center gap-1 shadow-2xs hover:text-red-600 cursor-pointer"
                >
                  <Play className="w-3 h-3 text-red-600" />
                  <span>+ Video</span>
                </button>
              </div>
            </div>

            {/* Media Items List */}
            <div className="space-y-3">
              {prodMedia.map((item, idx) => {
                const isCover = idx === 0;
                const isYoutube = item.url.includes('youtube.com') || item.url.includes('youtu.be');
                const isVimeo = item.url.includes('vimeo.com');

                return (
                  <div
                    key={item.id || idx}
                    className={`p-3 rounded-xl border transition-all bg-white flex flex-col gap-2.5 ${
                      isCover ? 'border-primary/60 ring-2 ring-primary/10 shadow-xs' : 'border-zinc-200'
                    }`}
                  >
                    {/* Item Top Bar */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-2xs font-extrabold uppercase tracking-wider ${
                          isCover 
                            ? 'bg-primary text-white shadow-2xs' 
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {isCover ? ('#1 MAIN COVER') : `#${idx + 1}`}
                        </span>

                        {/* Media Type Toggle Chips */}
                        <div className="flex items-center rounded-lg border border-zinc-200 p-0.5 bg-zinc-50">
                          <button
                            type="button"
                            onClick={() => updateMediaRow(idx, { type: 'image' })}
                            className={`px-2 py-0.5 rounded text-2xs font-bold uppercase transition-all cursor-pointer ${
                              item.type === 'image' ? 'bg-sky-600 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            Image
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMediaRow(idx, { type: 'gif' })}
                            className={`px-2 py-0.5 rounded text-2xs font-bold uppercase transition-all cursor-pointer ${
                              item.type === 'gif' ? 'bg-purple-600 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            GIF
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMediaRow(idx, { type: 'video' })}
                            className={`px-2 py-0.5 rounded text-2xs font-bold uppercase transition-all cursor-pointer ${
                              item.type === 'video' ? 'bg-red-600 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            Video
                          </button>
                        </div>
                      </div>

                      {/* Item Position / Ordering Actions */}
                      <div className="flex items-center gap-1">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => setAsCover(idx)}
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-2xs font-bold flex items-center gap-1 border border-amber-200 transition-colors cursor-pointer"
                            title="Make this the primary product cover (#1)"
                          >
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>Set Cover</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveMediaUp(idx)}
                          className="p-1 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move earlier in gallery sequence"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={idx === prodMedia.length - 1}
                          onClick={() => moveMediaDown(idx)}
                          className="p-1 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move later in gallery sequence"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {prodMedia.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedia(idx)}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer ml-1"
                            title="Remove media item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* URL Input & Upload Row */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => {
                            const val = e.target.value;
                            const detected = detectMediaType(val);
                            updateMediaRow(idx, { url: val, type: val ? detected : item.type });
                          }}
                          placeholder={
                            item.type === 'video' 
                              ? 'Enter MP4 direct URL, YouTube link, or Vimeo URL...' 
                              : item.type === 'gif'
                              ? 'Enter Animated GIF URL (.gif)...'
                              : 'Enter High-Res Image URL...'
                          }
                          className="w-full h-9 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary text-xs pr-8"
                        />
                      </div>

                      {/* File Upload Button (Image, GIF, Video) */}
                      <label className="h-9 px-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-2xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shrink-0 select-none shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept={item.type === 'video' ? 'video/mp4,video/webm,video/*' : item.type === 'gif' ? 'image/gif' : 'image/*,video/*'}
                          className="hidden"
                          onChange={(e) => onFileUpload(e, idx)}
                        />
                      </label>

                      {/* Mini Live Preview Thumbnail */}
                      {item.url && (
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-zinc-200 shrink-0 bg-zinc-950 flex items-center justify-center shadow-2xs">
                          {item.type === 'video' ? (
                            isYoutube ? (
                              <div className="w-full h-full bg-red-950 flex items-center justify-center">
                                <Play className="w-4 h-4 text-red-500 fill-red-500" />
                              </div>
                            ) : (
                              <video
                                src={item.url}
                                muted
                                autoPlay
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <Image
                              src={item.url}
                              alt={prodName ? `${prodName} media asset preview` : "Product media asset preview"}
                              fill
                              sizes="56px"
                              unoptimized={item.type === 'gif'}
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dedicated Hover Preview GIF Setting */}
            {setProdPreviewGifUrl && (
              <div className="pt-3 border-t border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-eyebrow font-bold text-zinc-800 block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>{'Dedicated Card Hover GIF (Optional)'}</span>
                  </span>
                  <span className="text-2xs text-zinc-500 block">
                    {'Automatically plays when customer hovers mouse over the product card.'}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:w-1/2">
                  <input
                    type="text"
                    value={prodPreviewGifUrl}
                    onChange={(e) => setProdPreviewGifUrl(e.target.value)}
                    placeholder="e.g. https://.../preview.gif"
                    className="flex-1 h-8 px-2.5 border border-zinc-200 rounded-lg text-xs focus:outline-hidden focus:border-purple-600"
                  />
                  <label className="h-8 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-2xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                    <Upload className="w-3 h-3" />
                    <span>Upload GIF</span>
                    <input
                      type="file"
                      accept="image/gif"
                      className="hidden"
                      onChange={(e) => {
                        handleImageUpload(e, (url) => setProdPreviewGifUrl(url), 'gifs');
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Descriptions & AI Helper Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/80 p-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-bold text-purple-900">
                  {'Gemini AI Description Assistant'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAiGenerateDescription}
                disabled={isAiGenerating}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-black transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span>{isAiGenerating ? ('Generating...') : ('✨ Generate with AI')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Details about raw material, weave, finish..."
                  className="w-full p-2.5 border border-zinc-200 rounded-xl resize-none focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Stock & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl h-10 mt-5">
              <input
                type="checkbox"
                id="instock-check"
                checked={prodInStock}
                onChange={(e) => setProdInStock(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="instock-check" className="font-bold cursor-pointer text-eyebrow text-zinc-700">
                Product In Stock
              </label>
            </div>
            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Stock Qty *</label>
              <input
                type="number"
                required
                min={0}
                value={prodStockQuantity}
                onChange={(e) => setProdStockQuantity(Number(e.target.value))}
                placeholder="e.g. 50"
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Low Stock Alert Threshold</label>
              <input
                type="number"
                min={1}
                value={prodLowStockThreshold === undefined ? '' : prodLowStockThreshold}
                onChange={(e) => setProdLowStockThreshold(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={`Default: ${siteSettings.lowStockThreshold || 5}`}
                className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>

          {/* Homepage Section Assignment Controls */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{'Homepage Display Sections'}</span>
              </h4>
              <p className="text-2xs text-amber-800/80 mt-0.5">
                {'Select which homepage sections this product should automatically appear in:'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2.5 p-2.5 bg-white border border-amber-200/90 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prodIsFlashDeal}
                  onChange={(e) => setProdIsFlashDeal(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">
                    ⚡ {'Flash Deals Countdown'}
                  </span>
                  <span className="text-2xs text-zinc-500 block">
                    {'Show in live homepage Flash Deals countdown bar'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white border border-amber-200/90 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prodIsBestDeal}
                  onChange={(e) => setProdIsBestDeal(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">
                    💰 {'Budget Deals Zone'}
                  </span>
                  <span className="text-2xs text-zinc-500 block">
                    {'Feature in homepage budget price tier zone'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white border border-amber-200/90 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prodIsNew}
                  onChange={(e) => setProdIsNew(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">
                    ✨ {'New Arrivals Catalog'}
                  </span>
                  <span className="text-2xs text-zinc-500 block">
                    {'Show in homepage fresh arrivals catalog section'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white border border-amber-200/90 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prodIsBrandMall}
                  onChange={(e) => setProdIsBrandMall(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">
                    🏢 {'Official Brand Mall'}
                  </span>
                  <span className="text-2xs text-zinc-500 block">
                    {'Promote in homepage verified official brand pavilion'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white border border-amber-200/90 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors sm:col-span-2">
                <input
                  type="checkbox"
                  checked={prodIsTrending}
                  onChange={(e) => setProdIsTrending(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">
                    🔥 {'Trending & Recommended Picks'}
                  </span>
                  <span className="text-2xs text-zinc-500 block">
                    {'Show in homepage trending & recommended highlights'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Best Deals Section Assignment */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <span className="text-primary font-bold">🔥</span>
                <span>{'Best Deals Section Assignment'}</span>
              </h4>
              <p className="text-2xs text-zinc-500 mt-0.5">
                {'Select which Best Deals page section this product belongs to:'}
              </p>
            </div>
            <select
              value={prodBestDealSectionId || ''}
              onChange={(e) => setProdBestDealSectionId && setProdBestDealSectionId(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl border border-zinc-200 bg-white font-medium text-zinc-800 focus:outline-hidden focus:border-primary"
            >
              <option value="">{'⭐ Auto Match by Category/Keywords'}</option>
              {(bestDealSections || []).map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.titleEn} ({sec.categorySlug})
                </option>
              ))}
            </select>
          </div>

          {/* Per-Product Badge Display Toggles */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-primary" />
                <span>{'🏷️ Product Card Badge Display Controls'}</span>
              </h4>
              <p className="text-2xs text-zinc-500 mt-0.5">
                {'Toggle exactly which badge layers should be displayed on this product card:'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 p-2 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prodShowDiscountBadge}
                  onChange={(e) => setProdShowDiscountBadge(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-2xs font-bold text-zinc-900 block leading-tight">
                    {'Discount %'}
                  </span>
                  <span className="text-2xs text-zinc-500 block leading-none">
                    {'e.g. -28%'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prodShowFlashBadge}
                  onChange={(e) => setProdShowFlashBadge(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-2xs font-bold text-zinc-900 block leading-tight">
                    {'Flash Sale'}
                  </span>
                  <span className="text-2xs text-zinc-500 block leading-none">
                    ⚡ FLASH
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prodShowTrendingBadge}
                  onChange={(e) => setProdShowTrendingBadge(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-2xs font-bold text-zinc-900 block leading-tight">
                    {'Trending'}
                  </span>
                  <span className="text-2xs text-zinc-500 block leading-none">
                    🔥 TRENDING
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prodShowMallBadge}
                  onChange={(e) => setProdShowMallBadge(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-2xs font-bold text-zinc-900 block leading-tight">
                    {'Brand Mall'}
                  </span>
                  <span className="text-2xs text-zinc-500 block leading-none">
                    🏢 MALL
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prodShowHotDealBadge}
                  onChange={(e) => setProdShowHotDealBadge(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-2xs font-bold text-zinc-900 block leading-tight">
                    {'Hot Deal'}
                  </span>
                  <span className="text-2xs text-zinc-500 block leading-none">
                    🏷️ HOT DEAL
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={prodShowNewBadge}
                  onChange={(e) => setProdShowNewBadge(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-2xs font-bold text-zinc-900 block leading-tight">
                    {'New Badge'}
                  </span>
                  <span className="text-2xs text-zinc-500 block leading-none">
                    ✨ NEW
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Per-Product Allowed Payment Methods Controls */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>{'🔒 Allowed Payment Methods'}</span>
              </h4>
              <p className="text-2xs text-zinc-500 mt-0.5">
                {'Toggle exactly which payment channels customers can use to purchase this specific product:'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'cod', label: 'Cash on Delivery (COD)',  icon: '🚚' },
                { id: 'bkash', label: 'bKash Mobile Pay',  icon: '📱' },
                { id: 'nagad', label: 'Nagad Mobile Pay',  icon: '📱' },
                { id: 'card', label: 'Debit/Credit Card',  icon: '💳' },
              ].map((pm) => {
                const isSelected = allowedPaymentMethods.includes(pm.id as any);
                return (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (!setAllowedPaymentMethods) return;
                        if (isSelected) {
                          if (allowedPaymentMethods.length <= 1) {
                            setModalError('At least one payment method must remain selected!');
                            return;
                          }
                          setAllowedPaymentMethods(allowedPaymentMethods.filter((m) => m !== pm.id));
                        } else {
                          setAllowedPaymentMethods([...allowedPaymentMethods, pm.id as any]);
                        }
                      }}
                      className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer shrink-0"
                    />
                    <div>
                      <span className="text-2xs block leading-tight">
                        {pm.icon} {pm.label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-zinc-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

