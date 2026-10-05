'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  aspectRatio?: 'banner' | 'square' | 'video' | 'card' | 'auto';
  className?: string;
}

/**
 * Resizes and compresses image file to a lightweight web-ready base64 data URL
 */
function processImageFile(file: File, maxDimension = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = document.createElement('img');
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // If PNG has transparency, keep PNG, otherwise JPEG
        const isPng = file.type === 'image/png';
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = 'Banner Image',
  value,
  onChange,
  placeholder = 'https://images.unsplash.com/... or upload from device',
  helperText,
  required = false,
  aspectRatio = 'banner',
  className = '',
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP, GIF)');
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      console.error('Image processing failed:', err);
      setError('Failed to process image. Please try another file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearImage = () => {
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAspectHeightClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square max-h-48';
      case 'video':
        return 'aspect-video max-h-48';
      case 'card':
        return 'aspect-4/3 max-h-44';
      case 'banner':
      default:
        return 'h-36 sm:h-40';
    }
  };

  return (
    <div className={`space-y-2 font-sans ${className}`}>
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-2xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>

        {/* Upload Mode Pill Tabs */}
        <div className="inline-flex p-0.5 bg-zinc-100 rounded-lg border border-zinc-200 text-2xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-white text-zinc-900 shadow-2xs font-extrabold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Upload className="w-3 h-3 text-primary" />
            <span>Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              activeMode === 'url'
                ? 'bg-white text-zinc-900 shadow-2xs font-extrabold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <LinkIcon className="w-3 h-3 text-zinc-500" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Device Upload Zone */}
      {activeMode === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-zinc-300 hover:border-primary/60 bg-zinc-50/70 hover:bg-zinc-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {isProcessing ? (
            <div className="py-4 flex flex-col items-center justify-center gap-2 text-primary">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <p className="text-xs font-bold">ইমেজ প্রসেসিং হচ্ছে...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800">
                  <span className="text-primary underline">Click here</span> to upload an image or drag and drop.
                </p>
                <p className="text-2xs text-zinc-500 mt-0.5">
                  JPG, PNG, WebP, GIF (Automatically optimized)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Direct URL Input */}
      {activeMode === 'url' && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={value}
                onChange={(e) => {
                  setError(null);
                  onChange(e.target.value);
                }}
                placeholder={placeholder}
                className="w-full h-9 pl-3 pr-8 text-xs rounded-xl border border-zinc-300 bg-white focus:border-primary focus:outline-hidden font-mono"
              />
              {value && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <label className="h-9 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-2xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shrink-0 select-none shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-2xs text-red-600 flex items-center gap-1 font-semibold">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text */}
      {helperText && <p className="text-2xs text-zinc-500">{helperText}</p>}

      {/* Live Preview Panel if Value exists */}
      {value && (
        <div className="mt-2.5 p-2 bg-zinc-100/80 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between pb-1.5 px-1">
            <span className="text-2xs font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Live Preview</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-2xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Change</span>
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="text-2xs font-bold text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
              >
                <X className="w-2.5 h-2.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
          <div
            className={`relative w-full rounded-lg overflow-hidden border border-zinc-300/80 bg-zinc-900 ${getAspectHeightClass()}`}
          >
            <Image
              src={value}
              alt={label ? `${label} upload preview` : "Uploaded media preview"}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
