'use client';

import React from 'react';
import Image from 'next/image';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { Layout, Image as ImageIcon, Link as LinkIcon, Clock } from 'lucide-react';

interface SmallBanner {
  image: string;
  link: string;
  title?: string;
  badge?: string;
}

interface SmallBannersManagerProps {
  bannerLayoutMode: 'hero_only' | 'hero_plus_one_small' | 'hero_plus_two_smalls';
  onChangeBannerLayoutMode: (mode: 'hero_only' | 'hero_plus_one_small' | 'hero_plus_two_smalls') => void;
  heroAutoPlayIntervalSeconds: number;
  onChangeAutoPlayInterval: (seconds: number) => void;
  smallBanner1?: SmallBanner;
  smallBanner2?: SmallBanner;
  onUpdateBanner1: (fields: Partial<SmallBanner>) => void;
  onUpdateBanner2: (fields: Partial<SmallBanner>) => void;
}

export const SmallBannersManager: React.FC<SmallBannersManagerProps> = ({
  bannerLayoutMode = 'hero_only',
  onChangeBannerLayoutMode,
  heroAutoPlayIntervalSeconds = 5,
  onChangeAutoPlayInterval,
  smallBanner1,
  smallBanner2,
  onUpdateBanner1,
  onUpdateBanner2,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Hero Banner & Promotional Banners Layout</h2>
        <p className="text-sm text-gray-500">Configure hero auto-slide timer, layout mode, and side promotional banners.</p>
      </div>

      {/* Auto-Slide Interval Timer Configuration */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-rose-600" />
          <span>Hero Auto-Slide Interval (Seconds)</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={30}
            value={heroAutoPlayIntervalSeconds}
            onChange={(e) => onChangeAutoPlayInterval(parseInt(e.target.value) || 5)}
            className="w-32 px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <span className="text-xs text-gray-500">Seconds before the carousel automatically transitions to the next slide (e.g. 5 seconds).</span>
        </div>
      </div>

      {/* Banner Layout Mode Selector */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <Layout className="w-4 h-4 text-rose-600" />
          <span>Banner Display Mode</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onChangeBannerLayoutMode('hero_only')}
            className={`p-3 rounded-xl border text-left transition ${
              bannerLayoutMode === 'hero_only'
                ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <strong className="block text-sm font-bold text-gray-900">Full-Width Hero Only</strong>
            <span className="text-xs text-gray-500">Only the main hero slider takes full screen width.</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeBannerLayoutMode('hero_plus_one_small')}
            className={`p-3 rounded-xl border text-left transition ${
              bannerLayoutMode === 'hero_plus_one_small'
                ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <strong className="block text-sm font-bold text-gray-900">Hero + 1 Small Banner</strong>
            <span className="text-xs text-gray-500">Main hero slider alongside 1 promotional side banner.</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeBannerLayoutMode('hero_plus_two_smalls')}
            className={`p-3 rounded-xl border text-left transition ${
              bannerLayoutMode === 'hero_plus_two_smalls'
                ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <strong className="block text-sm font-bold text-gray-900">Hero + 2 Small Banners</strong>
            <span className="text-xs text-gray-500">Main hero slider alongside 2 stacked side banners.</span>
          </button>
        </div>
      </div>

      {(bannerLayoutMode === 'hero_plus_one_small' || bannerLayoutMode === 'hero_plus_two_smalls') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          {/* Small Banner 1 */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-rose-600" /> Top Side Promotional Banner
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={smallBanner1?.image || ''}
                  onChange={(e) => onUpdateBanner1({ image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white mb-2"
                />
                <ImageUploadField
                  label="Upload Banner 1 Image"
                  value={smallBanner1?.image || ''}
                  onChange={(url: string) => onUpdateBanner1({ image: url })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5" /> Target Click Link (Redirect URL)
                </label>
                <input
                  type="text"
                  value={smallBanner1?.link || ''}
                  onChange={(e) => onUpdateBanner1({ link: e.target.value })}
                  placeholder="/shop?category=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Small Banner 2 */}
          {bannerLayoutMode === 'hero_plus_two_smalls' && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-rose-600" /> Bottom Side Promotional Banner
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={smallBanner2?.image || ''}
                    onChange={(e) => onUpdateBanner2({ image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white mb-2"
                  />
                  <ImageUploadField
                    label="Upload Banner 2 Image"
                    value={smallBanner2?.image || ''}
                    onChange={(url: string) => onUpdateBanner2({ link: smallBanner2?.link || '/shop', image: url })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5" /> Target Click Link (Redirect URL)
                  </label>
                  <input
                    type="text"
                    value={smallBanner2?.link || ''}
                    onChange={(e) => onUpdateBanner2({ link: e.target.value })}
                    placeholder="/shop?category=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
