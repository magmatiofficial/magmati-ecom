/**
 * @file components/product/ProductGallery.tsx
 * @description Master multi-media product gallery supporting Images, Animated GIFs,
 * and high-definition In-App Video Playback with responsive controls and fullscreen lightbox.
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  Film, 
  Layers
} from 'lucide-react';
import { Product, ProductMediaItem } from '@/types';
import { normalizeProductMedia, getYouTubeEmbedUrl, getVimeoEmbedUrl } from '@/lib/mediaUtils';

export interface ProductGalleryProps {
  images?: string[];
  media?: ProductMediaItem[];
  product?: Partial<Product> | null;
  productName: string;
}

export function ProductGallery({ images = [], media, product, productName }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isMainLoaded, setIsMainLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Normalize media items (from media prop, product object, or images array)
  const galleryMedia: ProductMediaItem[] = useMemo(() => {
    if (media && media.length > 0) {
      return media;
    }
    if (product) {
      return normalizeProductMedia(product);
    }
    if (images && images.length > 0) {
      return normalizeProductMedia({ images });
    }
    return normalizeProductMedia(null);
  }, [media, product, images]);

  // Safe active index without synchronous effect setState
  const safeActiveIdx = activeIdx < galleryMedia.length ? activeIdx : 0;
  const currentItem = galleryMedia[safeActiveIdx] || galleryMedia[0];

  useEffect(() => {
    setIsMainLoaded(false);
  }, [safeActiveIdx]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => {
      const cur = prev < galleryMedia.length ? prev : 0;
      return cur === 0 ? galleryMedia.length - 1 : cur - 1;
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => {
      const cur = prev < galleryMedia.length ? prev : 0;
      return cur === galleryMedia.length - 1 ? 0 : cur + 1;
    });
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const vid = videoRef.current;
    if (vid) {
      if (vid.paused) {
        vid.play();
        setIsPlaying(true);
      } else {
        vid.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const vid = videoRef.current;
    if (vid) {
      vid.muted = !vid.muted;
      setIsMuted(vid.muted);
    }
  };

  const youtubeEmbed = currentItem.type === 'video' ? getYouTubeEmbedUrl(currentItem.url) : null;
  const vimeoEmbed = currentItem.type === 'video' && !youtubeEmbed ? getVimeoEmbedUrl(currentItem.url) : null;

  return (
    <>
      {/* 
        Gallery Container:
        Fitted to available screen height without vertical scrolling,
        with thumbnail strip ordering reflecting exactly what the admin configured.
      */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 h-[68dvh] min-h-[480px] max-h-[620px] sm:h-[74dvh] sm:max-h-[680px] lg:h-[calc(100vh-135px)] lg:max-h-[760px] w-full">
        {/* Thumbnails list (Left side on desktop, bottom strip on mobile) */}
        {galleryMedia.length > 1 && (
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto custom-scrollbar-thin shrink-0 p-1 max-h-28 sm:max-h-32 lg:max-h-full">
            {galleryMedia.map((item, idx) => {
              const isActive = safeActiveIdx === idx;
              return (
                <button
                  key={item.id || `${item.url}-${idx}`}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`relative w-20 h-24 sm:w-22 sm:h-28 lg:w-24 lg:h-30 rounded-2xl overflow-hidden shrink-0 border-2 transition-all bg-white cursor-pointer group ${
                    isActive
                      ? 'border-primary shadow-md ring-2 ring-primary/25 scale-[1.03]'
                      : 'border-zinc-200/90 hover:border-zinc-400 opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`View ${item.type} ${idx + 1}`}
                >
                  {/* Thumbnail Preview */}
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-zinc-950 relative flex items-center justify-center">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title || `${productName} video`}
                          fill
                          sizes="96px"
                          referrerPolicy="no-referrer"
                          className="object-cover opacity-70"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-200">
                          <Film className="w-6 h-6 text-red-500 mb-1" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : item.type === 'gif' ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={item.url}
                        alt={item.title || `${productName} GIF animation`}
                        fill
                        unoptimized
                        sizes="96px"
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <Image
                        src={item.url}
                        alt={item.title || `${productName} photo ${idx + 1}`}
                        fill
                        sizes="96px"
                        referrerPolicy="no-referrer"
                        className="object-cover p-0.5"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Active Hero Product Stage (Video / GIF / Image) */}
        <div className="relative flex-1 h-full w-full rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-200/90 shadow-xs group flex items-center justify-center">
          {/* =========================================================================
           * CASE 1: IN-APP VIDEO PLAYBACK
           * ========================================================================= */}
          {currentItem.type === 'video' ? (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              {youtubeEmbed ? (
                <iframe
                  src={youtubeEmbed}
                  title={currentItem.title || `${productName} video player`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : vimeoEmbed ? (
                <iframe
                  src={vimeoEmbed}
                  title={currentItem.title || `${productName} vimeo player`}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center group/video">
                  <video
                    ref={videoRef}
                    src={currentItem.url}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => togglePlayPause()}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Custom In-App Video Controls Bar */}
                  <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/80 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between text-white border border-white/10 shadow-xl opacity-90 group-hover/video:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={togglePlayPause}
                        className="p-2 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-2 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <span className="text-2xs font-bold text-zinc-300 hidden sm:inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        In-App Video Stream
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            videoRef.current.play();
                            setIsPlaying(true);
                          }
                        }}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Replay from start"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : currentItem.type === 'gif' ? (
            /* =========================================================================
             * CASE 2: ANIMATED GIF PLAYBACK
             * ========================================================================= */
            <div className="w-full h-full relative bg-zinc-900 flex items-center justify-center">
              <Image
                src={currentItem.url}
                alt={currentItem.title || `${productName} animated GIF`}
                fill
                unoptimized
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                referrerPolicy="no-referrer"
                className="object-contain cursor-zoom-in"
                onClick={() => setIsFullscreen(true)}
              />
            </div>
          ) : (
            /* =========================================================================
             * CASE 3: STANDARD HIGH-RESOLUTION IMAGE
             * ========================================================================= */
            <div className="w-full h-full relative bg-zinc-50 flex items-center justify-center">
              {!isMainLoaded && (
                <div className="absolute inset-0 bg-zinc-50 flex flex-col items-center justify-center p-4">
                  <svg className="w-12 h-12 text-primary mb-1.5 opacity-80" viewBox="0 0 100 100" fill="currentColor">
                    <polygon points="50,15 90,85 10,85" />
                  </svg>
                  <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest">MAGMATI</span>
                </div>
              )}
              <Image
                src={currentItem.url}
                alt={currentItem.title || productName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                referrerPolicy="no-referrer"
                onLoad={() => setIsMainLoaded(true)}
                className={`object-cover transition-opacity duration-200 ${
                  isMainLoaded ? 'opacity-100' : 'opacity-90'
                } cursor-zoom-in`}
                onClick={() => setIsFullscreen(true)}
              />
            </div>
          )}

          {/* Fullscreen Lightbox Button Top-Right */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3.5 right-3.5 p-2.5 rounded-2xl bg-white/85 hover:bg-white text-zinc-800 shadow-md backdrop-blur-xs transition-all hover:scale-105 cursor-pointer z-10"
            title="Full Screen View"
            aria-label="Expand fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal (Supports Images, Animated GIFs, and In-App Videos) */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Media Lightbox Stage */}
          <div
            className="relative w-full h-full max-w-6xl max-h-[88dvh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.type === 'video' ? (
              <div className="w-full max-w-4xl aspect-video relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-zinc-800">
                {youtubeEmbed ? (
                  <iframe
                    src={youtubeEmbed}
                    title={currentItem.title || `${productName} fullscreen video`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : vimeoEmbed ? (
                  <iframe
                    src={vimeoEmbed}
                    title={currentItem.title || `${productName} fullscreen vimeo`}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={fullscreenVideoRef}
                    src={currentItem.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : currentItem.type === 'gif' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={currentItem.url}
                  alt={currentItem.title || productName}
                  fill
                  unoptimized
                  sizes="100vw"
                  referrerPolicy="no-referrer"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={currentItem.url}
                  alt={currentItem.title || productName}
                  fill
                  sizes="100vw"
                  referrerPolicy="no-referrer"
                  className="object-contain"
                />
              </div>
            )}

            {/* Navigation Arrows */}
            {galleryMedia.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer z-40"
                  aria-label="Previous media"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer z-40"
                  aria-label="Next media"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Bottom Status Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold border border-white/10 flex items-center gap-2 pointer-events-none">
              <span className="uppercase tracking-wider text-2xs text-zinc-300">
                {currentItem.type.toUpperCase()}
              </span>
              <span>•</span>
              <span>{activeIdx + 1} / {galleryMedia.length}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

