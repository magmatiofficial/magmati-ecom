'use client';

import React from 'react';
import { X, Sliders } from 'lucide-react';
import { ImageUploadField } from '../ImageUploadField';

interface SlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSlideId: string | null;
  slideImage?: string;
  setSlideImage?: (v: string) => void;
  slideBtnLink?: string;
  setSlideBtnLink?: (v: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
}

export const SlideModal: React.FC<SlideModalProps> = ({
  isOpen,
  onClose,
  editingSlideId,
  slideImage = '',
  setSlideImage = () => {},
  slideBtnLink = '',
  setSlideBtnLink = () => {},
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[88dvh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar">
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
                {'Configure slide image and target redirect link'}
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

        <form onSubmit={onSubmit} className="space-y-4 pt-4 text-xs font-sans">
          <ImageUploadField
            label="Slide Banner Image"
            value={slideImage}
            onChange={setSlideImage}
            placeholder="https://images.unsplash.com/... or upload from device"
            helperText="Upload a wide high-resolution banner image for the carousel"
            required
            aspectRatio="banner"
          />

          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Target Click Link (Redirect URL) *</label>
            <input
              type="text"
              required
              value={slideBtnLink}
              onChange={(e) => setSlideBtnLink(e.target.value)}
              placeholder="e.g. /shop?category=Electronics"
              className="w-full h-11 px-3.5 border border-zinc-200 rounded-xl focus:outline-hidden text-sm"
            />
            <span className="text-2xs text-zinc-400 mt-1 block">When customers click this banner slide, they will be redirected to this link.</span>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition shadow-sm"
            >
              {editingSlideId ? 'Update Slide' : 'Add Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
