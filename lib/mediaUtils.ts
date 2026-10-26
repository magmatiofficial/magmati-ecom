/**
 * @file lib/mediaUtils.ts
 * @description Robust utility helpers for rich media items (Images, Animated GIFs, In-App Videos).
 */

import { Product, ProductMediaItem, ProductMediaType } from '@/types';

/**
 * Detect media type from file name, URL or base64 data string
 */
export function detectMediaType(url: string): ProductMediaType {
  if (!url) return 'image';
  const clean = url.trim().toLowerCase();

  // Check for Video types
  if (
    clean.includes('youtube.com') ||
    clean.includes('youtu.be') ||
    clean.includes('vimeo.com') ||
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mov') ||
    clean.startsWith('data:video/')
  ) {
    return 'video';
  }

  // Check for Animated GIF types
  if (
    clean.endsWith('.gif') ||
    clean.includes('.gif?') ||
    clean.includes('/gif') ||
    clean.includes('giphy.com') ||
    clean.includes('tenor.com') ||
    clean.startsWith('data:image/gif')
  ) {
    return 'gif';
  }

  return 'image';
}

/**
 * Extract YouTube Embed URL or Video ID for seamless in-app iframe playback
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already an embed URL
  if (trimmed.includes('youtube.com/embed/')) {
    const id = trimmed.split('youtube.com/embed/')[1]?.split(/[?&]/)[0];
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1` : trimmed;
  }

  // standard watch?v=
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`;
  }

  return null;
}

/**
 * Extract Vimeo Embed URL
 */
export function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  if (match && match[3]) {
    return `https://player.vimeo.com/video/${match[3]}?autoplay=1&title=0&byline=0&portrait=0`;
  }
  return null;
}

/**
 * Extract YouTube Thumbnail URL from watch or embed link
 */
export function getYouTubeThumbnailUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
}

/**
 * Normalizes all media from a Product into an ordered ProductMediaItem[] array.
 * Respects custom media ordering set by Admin, with fallback to images/videoUrl/previewGifUrl.
 */
export function normalizeProductMedia(product?: Partial<Product> | null): ProductMediaItem[] {
  if (!product) return [];

  // If explicit media array is provided and not empty
  if (product.media && Array.isArray(product.media) && product.media.length > 0) {
    return product.media.map((item, idx) => {
      const detectedType = item.type || detectMediaType(item.url);
      let thumb = item.thumbnailUrl;
      if (!thumb) {
        if (detectedType === 'image' || detectedType === 'gif') {
          thumb = item.url;
        } else if (detectedType === 'video') {
          thumb = getYouTubeThumbnailUrl(item.url) || undefined;
        }
      }
      return {
        id: item.id || `media-${idx}-${Date.now()}`,
        type: detectedType,
        url: item.url,
        thumbnailUrl: thumb,
        title: item.title || `Media ${idx + 1}`,
        videoSource: item.videoSource,
      };
    });
  }

  const items: ProductMediaItem[] = [];

  // If product has dedicated preview GIF and it's not first
  if (product.previewGifUrl) {
    items.push({
      id: 'media-preview-gif',
      type: 'gif',
      url: product.previewGifUrl,
      title: 'Preview Animation',
    });
  }

  // Convert images array
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img, idx) => {
      if (img && !items.some((existing) => existing.url === img)) {
        const type = detectMediaType(img);
        items.push({
          id: `img-${idx}`,
          type,
          url: img,
          thumbnailUrl: type === 'video' ? (getYouTubeThumbnailUrl(img) || undefined) : img,
          title: `Product View ${idx + 1}`,
        });
      }
    });
  }

  // Convert videoUrl if exists and not yet in list
  if (product.videoUrl && !items.some((existing) => existing.url === product.videoUrl)) {
    items.push({
      id: 'media-video-primary',
      type: 'video',
      url: product.videoUrl,
      thumbnailUrl: getYouTubeThumbnailUrl(product.videoUrl) || undefined,
      title: 'Product Demonstration Video',
    });
  }

  if (items.length === 0) {
    items.push({
      id: 'media-default-placeholder',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      title: 'Product Image',
    });
  }

  return items;
}

/**
 * Finds the best GIF for hover preview (either designated previewGifUrl, or first GIF in media)
 */
export function getProductHoverGif(product: Product): string | null {
  if (product.previewGifUrl) return product.previewGifUrl;
  if (product.media && product.media.length > 0) {
    const gifItem = product.media.find((m) => m.type === 'gif' || m.url.endsWith('.gif') || m.url.includes('.gif'));
    if (gifItem) return gifItem.url;
  }
  if (product.images && product.images.length > 0) {
    const gifImg = product.images.find((img) => img.endsWith('.gif') || img.includes('.gif'));
    if (gifImg) return gifImg;
  }
  return null;
}

/**
 * Finds the best primary display image for card covers and catalog thumbnails.
 * Guarantees that video URLs (.mp4, youtube, etc.) are NOT returned as direct image sources.
 */
export function getProductDisplayImage(product?: Partial<Product> | null): string {
  const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
  if (!product) return fallback;

  // 1. If explicit media items exist
  if (product.media && Array.isArray(product.media) && product.media.length > 0) {
    // Prefer first image or gif
    const firstImg = product.media.find((m) => m.type !== 'video' && detectMediaType(m.url) !== 'video' && m.url && m.url.trim().length > 0);
    if (firstImg && firstImg.url) return firstImg.url;

    // If only video, check if it has a thumbnail
    const videoWithThumb = product.media.find((m) => m.thumbnailUrl && m.thumbnailUrl.trim().length > 0);
    if (videoWithThumb && videoWithThumb.thumbnailUrl) return videoWithThumb.thumbnailUrl;
  }

  // 2. Check images array for non-video URLs
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstNonVideo = product.images.find((img) => img && img.trim().length > 0 && detectMediaType(img) !== 'video');
    if (firstNonVideo) return firstNonVideo;
  }

  // 3. Fallback
  return fallback;
}

/**
 * Finds the secondary image for hover flip or gallery secondary preview
 */
export function getProductSecondaryImage(product?: Partial<Product> | null): string | null {
  if (!product) return null;

  const displayImage = getProductDisplayImage(product);

  // Check media
  if (product.media && Array.isArray(product.media) && product.media.length > 1) {
    const sec = product.media.find((m) => m.url !== displayImage && m.type !== 'video' && detectMediaType(m.url) !== 'video' && m.url && m.url.trim().length > 0);
    if (sec) return sec.url;
  }

  // Check images
  if (product.images && Array.isArray(product.images) && product.images.length > 1) {
    const sec = product.images.find((img) => img !== displayImage && img && img.trim().length > 0 && detectMediaType(img) !== 'video');
    if (sec) return sec;
  }

  return null;
}

/**
 * Checks if product has at least one video
 */
export function hasProductVideo(product?: Partial<Product> | null): boolean {
  if (!product) return false;
  if (product.videoUrl) return true;
  if (product.media && product.media.some((m) => m.type === 'video')) return true;
  if (product.images && product.images.some((img) => detectMediaType(img) === 'video')) return true;
  return false;
}

