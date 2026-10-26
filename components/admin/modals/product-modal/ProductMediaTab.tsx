import React from 'react';
import Image from 'next/image';
import { Upload, Film, Image as ImageIcon, Play, ArrowUp, ArrowDown, Trash2, Sliders } from 'lucide-react';
import { ProductMediaItem, ProductMediaType } from '@/types';

export interface ProductMediaTabProps {
  prodMedia: ProductMediaItem[];
  setProdMedia?: React.Dispatch<React.SetStateAction<ProductMediaItem[]>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void, folder?: string) => void;
  handleMediaUpload?: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string, type: ProductMediaType) => void, folder?: string) => void;
  moveMediaUp: (idx: number) => void;
  moveMediaDown: (idx: number) => void;
  setAsCover: (idx: number) => void;
  removeMedia: (idx: number) => void;
  addMediaRow: (type?: ProductMediaType) => void;
  updateMediaRow: (idx: number, patch: Partial<ProductMediaItem>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
  isActive: boolean;
}

export const ProductMediaTab: React.FC<ProductMediaTabProps> = ({
  prodMedia = [],
  moveMediaUp,
  moveMediaDown,
  setAsCover,
  removeMedia,
  addMediaRow,
  updateMediaRow,
  onFileUpload,
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-zinc-900 block text-xs">Product Media Gallery & Reordering</span>
          <span className="text-2xs text-zinc-500">Add images, GIFs, and videos. First item is the main cover.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => addMediaRow('image')}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Add Image
          </button>
          <button
            type="button"
            onClick={() => addMediaRow('video')}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5" />
            Add Video
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {prodMedia.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-2xl p-6">
            <p className="text-zinc-500 text-xs mb-2">No media added yet.</p>
            <button
              type="button"
              onClick={() => addMediaRow('image')}
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
            >
              Add First Image
            </button>
          </div>
        ) : (
          prodMedia.map((m, idx) => (
            <div key={m.id || idx} className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-2xs shrink-0">
                  {idx + 1}
                </span>
                <div className="relative w-14 h-14 bg-white rounded-xl border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {m.type === 'video' ? (
                    <Film className="w-6 h-6 text-zinc-400" />
                  ) : m.url ? (
                    <Image src={m.url} alt={`Media ${idx + 1}`} fill className="object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-zinc-300" />
                  )}
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full">
                  <select
                    value={m.type || 'image'}
                    onChange={(e) => updateMediaRow(idx, { type: e.target.value as ProductMediaType })}
                    className="h-8 px-2 border border-zinc-200 rounded-lg bg-white text-xs w-28 sm:w-32 shrink-0"
                  >
                    <option value="image">Image</option>
                    <option value="gif">Animated GIF</option>
                    <option value="video">Video</option>
                  </select>
                  <input
                    type="text"
                    value={m.url || ''}
                    onChange={(e) => updateMediaRow(idx, { url: e.target.value })}
                    placeholder="Paste Media URL or upload..."
                    className="flex-1 min-w-0 h-8 px-2.5 border border-zinc-200 rounded-lg text-xs bg-white"
                  />
                  <label className="shrink-0 px-2.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg font-bold text-2xs cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap">
                    <Upload className="w-3 h-3" />
                    Upload
                    <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={(e) => onFileUpload(e, idx)} />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-2 sm:mt-0 self-end sm:self-center shrink-0">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsCover(idx)}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-bold text-2xs transition-colors cursor-pointer"
                    title="Set as Cover Image"
                  >
                    Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => moveMediaUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 text-zinc-500 hover:bg-zinc-200 rounded-lg disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveMediaDown(idx)}
                  disabled={idx === prodMedia.length - 1}
                  className="p-1.5 text-zinc-500 hover:bg-zinc-200 rounded-lg disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeMedia(idx)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  title="Remove Media"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
