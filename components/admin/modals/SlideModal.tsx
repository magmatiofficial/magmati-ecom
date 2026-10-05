'use client';

import React from 'react';
import Image from 'next/image';
import { X, Upload, Sliders } from 'lucide-react';
import { ImageUploadField } from '../ImageUploadField';

interface SlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSlideId: string | null;
  
  slideTitle?: string;
  setSlideTitle?: (v: string) => void;
  slideTitleEn?: string;
  setSlideTitleEn?: (v: string) => void;
  
  slideSubtitle?: string;
  setSlideSubtitle?: (v: string) => void;
  slideSubtitleEn?: string;
  setSlideSubtitleEn?: (v: string) => void;

  slideBadge?: string;
  setSlideBadge?: (v: string) => void;
  slideBadgeEn?: string;
  setSlideBadgeEn?: (v: string) => void;
  
  slideImage?: string;
  setSlideImage?: (v: string) => void;
  slideBtnText?: string;
  setSlideBtnText?: (v: string) => void;
  slideBtnTextEn?: string;
  setSlideBtnTextEn?: (v: string) => void;
  
  slideBtnLink?: string;
  setSlideBtnLink?: (v: string) => void;
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void, folder?: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  handleSubmit?: (e: React.FormEvent) => void;
}

export const SlideModal: React.FC<SlideModalProps> = ({
  isOpen,
  onClose,
  editingSlideId,
  slideTitle = '',
  setSlideTitle = () => {},
  slideSubtitle = '',
  setSlideSubtitle = () => {},
  slideBadge = '',
  setSlideBadge = () => {},
  slideImage = '',
  setSlideImage = () => {},
  slideBtnText = '',
  setSlideBtnText = () => {},
  slideBtnLink = '',
  setSlideBtnLink = () => {},
  handleImageUpload = () => {},
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[88dvh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                {editingSlideId
                  ? ('Edit Hero Banner Slide')
                  : ('Add New Hero Banner Slide')}
              </h3>
              <p className="text-eyebrow text-zinc-500">
                {'Configure image, heading, call-to-action & deep link for carousel'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-4 text-xs font-sans max-h-[75dvh] overflow-y-auto pr-1">
          <ImageUploadField
            label="Slide Image"
            value={slideImage}
            onChange={setSlideImage}
            placeholder="https://images.unsplash.com/... or upload from device"
            helperText="Upload a 16:9 or wide banner image for the slider"
            required
            aspectRatio="banner"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Badge Tag</label>
            <input
              type="text"
              value={slideBadge}
              onChange={(e) => setSlideBadge(e.target.value)}
              placeholder="e.g. FESTIVE COLLECTION"
              className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Slide Title *</label>
            <input
              type="text"
              required
              value={slideTitle}
              onChange={(e) => setSlideTitle(e.target.value)}
              placeholder="e.g. Royal Silk Festive Wear"
              className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Subtitle</label>
            <input
              type="text"
              value={slideSubtitle}
              onChange={(e) => setSlideSubtitle(e.target.value)}
              placeholder="e.g. Hand-tailored panjabis & sarees"
              className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Button Text</label>
            <input
              type="text"
              value={slideBtnText}
              onChange={(e) => setSlideBtnText(e.target.value)}
              placeholder="e.g. Shop Festive"
              className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden"
            />
          </div>
          </div>

          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Button Target Link *</label>
            <input
              type="text"
              required
              value={slideBtnLink}
              onChange={(e) => setSlideBtnLink(e.target.value)}
              placeholder="/shop or /category/mens-fashion"
              className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden font-mono text-xs"
            />
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
              {editingSlideId ? 'Update Slide' : 'Add Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
