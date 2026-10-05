/**
 * @file components/admin/BestDealsTab.tsx
 * @description Master Admin HQ Management Tab for Best Deals Showcases.
 * Features:
 * - List all deal emporiums with thumbnail previews & live status
 * - Drag/order reordering (move up, move down)
 * - Add new section & Edit modal integration
 * - Quick toggle enabled/disabled
 * - Delete section & Restore Defaults
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Flame, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Eye, 
  RotateCcw, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { useBestDealsStore } from '@/store/useBestDealsStore';
import { BestDealSection } from '@/types/bestDeals';
import { BestDealSectionModal } from './modals/BestDealSectionModal';

export function BestDealsTab() {
  const { 
    sections, 
    addSection, 
    updateSection, 
    deleteSection, 
    toggleSection, 
    moveSection, 
    resetToDefault 
  } = useBestDealsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<BestDealSection | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingSection(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (section: BestDealSection) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleSave = (sectionData: Omit<BestDealSection, 'id' | 'order'> | Partial<BestDealSection>) => {
    if (editingSection) {
      updateSection(editingSection.id, sectionData);
    } else {
      addSection(sectionData as Omit<BestDealSection, 'id' | 'order'>);
    }
  };

  const handleRestoreDefaults = () => {
    resetToDefault();
    setShowRestoreConfirm(false);
    setFeedbackMsg(
      'All 12 Best Deals showcase sections restored to defaults successfully!'
    );
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg('')}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">
              {'Best Deals Showcase Manager'}
            </h2>
          </div>
          <p className="text-xs text-zinc-500">
            {'Manage Category Showcases, Promo Banners, and product grids on the /best-deals page.'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            href="/best-deals"
            target="_blank"
            className="px-3.5 py-2 text-xs font-bold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200/70 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{'View Live Page'}</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </Link>

          {!showRestoreConfirm ? (
            <button
              type="button"
              onClick={() => setShowRestoreConfirm(true)}
              className="px-3.5 py-2 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/60 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{'Restore Defaults'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 p-1.5 bg-amber-50 border border-amber-300 rounded-xl animate-in fade-in">
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{'Confirm Restore'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRestoreConfirm(false)}
                className="px-2.5 py-1.5 bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{'Add Section'}</span>
          </button>
        </div>
      </div>

      {/* 2. Sections Table / Card List */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
            {`Total Sections: ${sortedSections.length}`}
          </span>
          <span className="text-2xs text-zinc-400">
            {'Click arrows to reorder layout'}
          </span>
        </div>

        <div className="divide-y divide-zinc-100">
          {sortedSections.map((section, index) => {
            const isFirst = index === 0;
            const isLast = index === sortedSections.length - 1;

            return (
              <div
                key={section.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
              >
                {/* Left Info & Banner Thumbnail */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Order Badge & Reorder Buttons */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveSection(section.id, 'up')}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isFirst
                          ? 'text-zinc-300 cursor-not-allowed'
                          : 'text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 text-2xs font-black flex items-center justify-center border border-zinc-200">
                      {section.order}
                    </span>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveSection(section.id, 'down')}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isLast
                          ? 'text-zinc-300 cursor-not-allowed'
                          : 'text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Banner Thumbnail Preview */}
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-200 shrink-0">
                    {section.banner.image ? (
                      <Image
                        src={section.banner.image}
                        alt={section.titleEn || (section as any).title || "Best deal promotional section banner"}
                        fill
                        sizes="64px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <Flame className="w-4 h-4" />
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-2xs font-bold text-center rounded-xs truncate px-0.5">
                      {(section.banner as any).badgeEn || (section.banner as any).tag || 'DEAL'}
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-zinc-900">
                        {section.titleEn || (section as any).title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-2xs font-semibold border border-zinc-200">
                        {section.categorySlug}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-2xs text-zinc-500 flex-wrap">
                      <span>
                        Headline: <strong className="text-zinc-800">{(section.banner as any).headingEn || (section.banner as any).heading}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Badge: <strong className="text-primary">{(section.banner as any).badgeEn || (section.banner as any).tag}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Target: <span className="font-mono text-zinc-600">{section.seeMoreLink}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`px-3 py-1.5 rounded-lg text-2xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      section.enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200'
                    }`}
                  >
                    {section.enabled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(section)}
                    className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer border border-zinc-200/80"
                    title="Edit Section"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => {
                      deleteSection(section.id);
                      setFeedbackMsg(
                        `Section "${section.titleEn || (section as any).title}" deleted`
                      );
                      setTimeout(() => setFeedbackMsg(''), 3500);
                    }}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-200/60"
                    title="Delete Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {sortedSections.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <Flame className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-sm font-semibold text-zinc-600">
                No Best Deals sections configured yet.
              </p>
              <button
                type="button"
                onClick={resetToDefault}
                className="px-4 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl"
              >
                Restore Default Sections
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Add / Edit Modal */}
      <BestDealSectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingSection}
      />
    </div>
  );
}
