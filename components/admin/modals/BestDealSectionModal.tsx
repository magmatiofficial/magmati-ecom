/**
 * @file components/admin/modals/BestDealSectionModal.tsx
 * @description Modal dialog for adding or editing a Best Deal showcase section with live banner preview.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Save, Image as ImageIcon, Flame, Check } from 'lucide-react';
import { BestDealSection } from '@/types/bestDeals';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useProductStore } from '@/store/useProductStore';
import { ImageUploadField } from '../ImageUploadField';

interface BestDealSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sectionData: Omit<BestDealSection, 'id' | 'order'> | Partial<BestDealSection>) => void;
  initialData?: BestDealSection | null;
}

function SectionModalForm({
  initialData,
  onClose,
  onSave,
}: {
  initialData?: BestDealSection | null;
  onClose: () => void;
  onSave: (sectionData: Omit<BestDealSection, 'id' | 'order'> | Partial<BestDealSection>) => void;
}) {
  const { categories } = useCategoryStore();
  const { products } = useProductStore();

  const [titleEn, setTitleEn] = useState(initialData?.titleEn || '');
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug || 'men-fashion');
  const [keywords, setKeywords] = useState(initialData?.keywords?.join(', ') || '');
  const [seeMoreLink, setSeeMoreLink] = useState(initialData?.seeMoreLink || '/shop');
  const [maxProducts, setMaxProducts] = useState(initialData?.maxProducts || 6);
  const [stylePreset, setStylePreset] = useState<BestDealSection['stylePreset']>(
    initialData?.stylePreset || 'standard'
  );
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true);

  // Banner properties
  const [bannerImage, setBannerImage] = useState(
    initialData?.banner?.image ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
  );
  const [bannerTagEn, setBannerTagEn] = useState(initialData?.banner?.tagEn || 'UP TO 50% OFF');
  const [bannerHeadingEn, setBannerHeadingEn] = useState(
    initialData?.banner?.headingEn || 'SPECIAL MEGA SALE'
  );
  const [bannerSubheadingEn, setBannerSubheadingEn] = useState(
    initialData?.banner?.subheadingEn || 'Unbeatable Quality & Best Price'
  );
  const [bannerLink, setBannerLink] = useState(initialData?.banner?.link || '/shop');
  const [bannerBgColor, setBannerBgColor] = useState(initialData?.banner?.bgColor || '#1e293b');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedKeywords = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const sectionPayload = {
      titleEn,
      categorySlug,
      keywords: parsedKeywords,
      seeMoreLink: seeMoreLink || `/shop?category=${categorySlug}`,
      maxProducts: Number(maxProducts) || 6,
      stylePreset,
      enabled,
      banner: {
        image: bannerImage,
        tagEn: bannerTagEn,
        headingEn: bannerHeadingEn,
        subheadingEn: bannerSubheadingEn,
        link: bannerLink || seeMoreLink || '/shop',
        bgColor: bannerBgColor,
      },
    };

    onSave(sectionPayload);
    onClose();
  };

  return (
    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-y-auto max-h-[92dvh] custom-scrollbar my-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              {initialData
                ? 'Edit Best Deal Section'
                : 'Add New Best Deal Section'}
            </h3>
            <p className="text-2xs text-zinc-500">
              {'Customize section titles, linked category, and promo banner'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-200/50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78dvh] overflow-y-auto">
        {/* Section Titles */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
              Section Title *
            </label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Bag Emporium"
              className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category Link & Keywords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
              Target Category *
            </label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug || cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
              Search Keywords (comma separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="bag, backpack, leather"
              className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>

        {/* Links & Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
              &quot;See More&quot; Destination Link
            </label>
            <input
              type="text"
              value={seeMoreLink}
              onChange={(e) => setSeeMoreLink(e.target.value)}
              placeholder="/shop?q=bag"
              className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
              Max Products
            </label>
            <input
              type="number"
              min={2}
              max={12}
              value={maxProducts}
              onChange={(e) => setMaxProducts(Number(e.target.value))}
              className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
            Visual Style Preset
          </label>
          <select
            value={stylePreset}
            onChange={(e) => setStylePreset(e.target.value as BestDealSection['stylePreset'])}
            className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden bg-white"
          >
            <option value="standard">Standard</option>
            <option value="minimal">Minimal</option>
            <option value="highlighted">Highlighted</option>
            <option value="patterned">Patterned</option>
          </select>
        </div>

        {/* Promo Banner Settings Divider */}
        <div className="pt-2 border-t border-zinc-200">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-zinc-900">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span>Promotional Card Customization (Supports standard 16:9, 4:3 or product photo)</span>
          </div>

          <div className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <ImageUploadField
              label="Card / Showcase Promo Image"
              value={bannerImage}
              onChange={setBannerImage}
              placeholder="https://images.unsplash.com/... or upload from device"
              helperText="Upload a product or offer image. It will be professionally scaled for the card."
              required
              aspectRatio="card"
            />

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
                  Discount Badge Text
                </label>
                <input
                  type="text"
                  value={bannerTagEn}
                  onChange={(e) => setBannerTagEn(e.target.value)}
                  placeholder="UP TO 60% OFF"
                  className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
                  Banner Main Headline *
                </label>
                <input
                  type="text"
                  required
                  value={bannerHeadingEn}
                  onChange={(e) => setBannerHeadingEn(e.target.value)}
                  placeholder="PACK YOUR DREAMS BACKPACK"
                  className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
                  Banner Subtitle
                </label>
                <input
                  type="text"
                  value={bannerSubheadingEn}
                  onChange={(e) => setBannerSubheadingEn(e.target.value)}
                  placeholder="Starting From BDT 950"
                  className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
                  Banner Target Link
                </label>
                <input
                  type="text"
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  placeholder="/shop?q=bag"
                  className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider">
                  Card Background Color (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bannerBgColor}
                    onChange={(e) => setBannerBgColor(e.target.value)}
                    className="w-9 h-9 p-0.5 rounded-lg border border-zinc-300 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={bannerBgColor}
                    onChange={(e) => setBannerBgColor(e.target.value)}
                    className="flex-1 h-9 px-3 text-xs rounded-lg border border-zinc-300 focus:border-primary focus:outline-hidden bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enable Toggle */}
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-primary rounded-sm border-zinc-300 focus:ring-primary"
            />
            <span className="text-xs font-semibold text-zinc-800">
              {'Section is active and visible'}
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Section</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function BestDealSectionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: BestDealSectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar">
      <SectionModalForm
        key={initialData?.id || 'new-section'}
        initialData={initialData}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}
