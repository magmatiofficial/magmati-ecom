'use client';

import { create } from 'zustand';
import { auth } from '@/lib/firebase';

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  userName: string;
  userLocation: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string; // ISO date or human string
  verified: boolean;
  helpfulCount: number;
}

interface ReviewState {
  reviews: ProductReview[];
  loading: boolean;
  fetchReviews: (productId?: string) => Promise<void>;
  addReview: (data: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>) => Promise<{ ok: boolean; error?: string }>;
  toggleHelpful: (reviewId: string) => Promise<void>;
  getReviewsByProductId: (productId: string) => ProductReview[];
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  loading: false,

  fetchReviews: async (productId?: string) => {
    set({ loading: true });
    try {
      const url = productId
        ? `/api/reviews?productId=${encodeURIComponent(productId)}&limit=100`
        : '/api/reviews?limit=100';
      const res = await fetch(url);
      if (!res.ok) {
        console.error('[ReviewStore] Failed to fetch reviews, status:', res.status);
        set({ loading: false });
        return;
      }

      const data = (await res.json()) as { success?: boolean; reviews?: ProductReview[] };
      if (data.success && Array.isArray(data.reviews)) {
        if (productId) {
          set((state) => ({
            reviews: [
              ...state.reviews.filter((r) => r.productId !== productId),
              ...data.reviews!,
            ],
            loading: false,
          }));
        } else {
          set({ reviews: data.reviews, loading: false });
        }
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('[ReviewStore] Fetch reviews error:', err);
      set({ loading: false });
    }
  },

  addReview: async (data: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>) => {
    try {
      const user = auth?.currentUser;
      if (!user) {
        return { ok: false, error: 'Please sign in to write a review.' };
      }

      const token = await user.getIdToken();
      const payload = {
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
        userLocation: data.userLocation,
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        review?: ProductReview;
        error?: string;
      };

      if (res.status === 201 && json.success && json.review) {
        set((state) => ({
          reviews: [json.review!, ...state.reviews.filter((r) => r.id !== json.review!.id)],
        }));
        return { ok: true };
      }

      const errorMsg = json.error || 'Failed to submit review.';
      return { ok: false, error: errorMsg };
    } catch (err) {
      console.error('[ReviewStore] Add review error:', err);
      return { ok: false, error: 'Network error submitting review.' };
    }
  },

  toggleHelpful: async (reviewId: string) => {
    try {
      const user = auth?.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: reviewId, action: 'helpful' }),
      });

      if (!res.ok) {
        console.error('[ReviewStore] Failed to toggle helpful, status:', res.status);
        return;
      }

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        helpfulCount?: number;
        helpedByMe?: boolean;
      };

      if (data.success && typeof data.helpfulCount === 'number') {
        const newCount = data.helpfulCount;
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId ? { ...r, helpfulCount: newCount } : r
          ),
        }));
      }
    } catch (err) {
      console.error('[ReviewStore] Toggle helpful error:', err);
    }
  },

  getReviewsByProductId: (productId: string) => {
    return get().reviews.filter((r) => r.productId === productId);
  },
}));
