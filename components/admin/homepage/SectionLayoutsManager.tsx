'use client';

import React, { useState } from 'react';
import { LayoutGrid, Plus, Trash2, Edit2, ArrowUp, ArrowDown } from 'lucide-react';

interface SectionLayout {
  id: string;
  name?: string;
  nameEn?: string;
  enabled: boolean;
  customTitle?: string;
  customSubtitle?: string;
  preset: string;
}

interface SectionLayoutsManagerProps {
  sectionLayouts: SectionLayout[];
  onToggleSection: (id: string) => void;
  onMoveSection: (index: number, direction: 'up' | 'down') => void;
  onUpdateSection: (id: string, fields: Partial<SectionLayout>) => void;
  onDeleteSection: (id: string) => void;
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

export const SectionLayoutsManager: React.FC<SectionLayoutsManagerProps> = ({
  sectionLayouts,
  onToggleSection,
  onMoveSection,
  onUpdateSection,
  onDeleteSection,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Homepage Section Order & Visibility</h2>
          <p className="text-sm text-gray-500">Reorder and toggle homepage sections to customize your store layout.</p>
        </div>
      </div>

      <div className="space-y-3">
        {sectionLayouts.map((sec, idx) => (
          <div key={sec.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-6">#{idx + 1}</span>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  {sec.nameEn || sec.name || SECTION_NAMES[sec.id] || sec.id}
                </h4>
                <p className="text-xs text-gray-500">Preset: {sec.preset}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onMoveSection(idx, 'up')}
                disabled={idx === 0}
                className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ArrowUp className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => onMoveSection(idx, 'down')}
                disabled={idx === sectionLayouts.length - 1}
                className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ArrowDown className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => onToggleSection(sec.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold ${
                  sec.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {sec.enabled ? 'Enabled' : 'Disabled'}
              </button>
              <button
                onClick={() => onDeleteSection(sec.id)}
                className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
