'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addReview: (review: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>) => void;
  toggleHelpful: (reviewId: string) => void;
  getReviewsByProductId: (productId: string) => ProductReview[];
}

const initialReviews: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'elec-ultra-watch-pro',
    productName: 'Ultra AMOLED Calling Smartwatch (Metallic Titanium)',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    productPrice: 3450,
    userName: 'Tanvir Hossain',
    userLocation: 'Dhanmondi, Dhaka',
    rating: 5,
    comment: 'Display quality is outstanding, battery lasts easily 6-7 days with calling active. Very quick 24-hour delivery!',
    createdAt: '2026-09-12T10:00:00.000Z',
    verified: true,
    helpfulCount: 42,
  },
  {
    id: 'rev-2',
    productId: 'elec-anc-wireless-earbuds',
    productName: 'Spatial Audio ANC Wireless Earbuds (35dB Hybrid Noise Cancelling)',
    productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    productPrice: 2650,
    userName: 'Sadia Jahan',
    userLocation: 'Uttara, Dhaka',
    rating: 5,
    comment: 'The active noise cancellation is top notch for Dhaka traffic. Deep bass and crystal clear mic quality for meetings.',
    createdAt: '2026-09-11T14:30:00.000Z',
    verified: true,
    helpfulCount: 38,
  },
  {
    id: 'rev-3',
    productId: 'men-kabli-suit-navy',
    productName: 'Embroidered Premium Cotton Kabli Set (Navy Blue)',
    productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    productPrice: 3250,
    userName: 'Mahmudul Hasan',
    userLocation: 'Zindabazar, Sylhet',
    rating: 5,
    comment: 'Sizing is 100% accurate and the handloom cotton finish is very comfortable in summer heat.',
    createdAt: '2026-09-08T09:15:00.000Z',
    verified: true,
    helpfulCount: 56,
  },
  {
    id: 'rev-4',
    productId: 'home-digital-air-fryer',
    productName: 'Digital Touch Smart Air Fryer (5.5L Rapid Airflow)',
    productImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    productPrice: 5850,
    userName: 'Farhana Akhter',
    userLocation: 'GEC Circle, Chittagong',
    rating: 5,
    comment: 'Official 2 years brand warranty card included in the box. Fried crispy chicken with zero oil. Excellent packaging!',
    createdAt: '2026-09-05T16:20:00.000Z',
    verified: true,
    helpfulCount: 31,
  },
  {
    id: 'rev-5',
    productId: 'elec-gan-fast-charger',
    productName: 'Baseus 65W GaN Fast Charger (3-Port Multi Protocol)',
    productImage: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    productPrice: 1950,
    userName: 'Shakil Ahmed',
    userLocation: 'Boalia, Rajshahi',
    rating: 5,
    comment: 'Charges my MacBook and phone at the same time rapidly without any heating. Reached Rajshahi in 48 hours.',
    createdAt: '2026-09-02T11:45:00.000Z',
    verified: true,
    helpfulCount: 29,
  },
  {
    id: 'rev-6',
    productId: 'women-muslin-jamdani-saree',
    productName: 'Handwoven Pure Dhakai Jamdani Saree (Royal Crimson)',
    productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    productPrice: 6500,
    userName: 'Nusrat Imroz',
    userLocation: 'Gulshan-2, Dhaka',
    rating: 5,
    comment: 'Authentic pure thread work. Looks even more breathtaking in person than the photos. Highly recommended!',
    createdAt: '2026-08-28T18:10:00.000Z',
    verified: true,
    helpfulCount: 47,
  }
];

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: initialReviews,

      addReview: (newReviewData) => {
        const newReview: ProductReview = {
          ...newReviewData,
          id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          createdAt: new Date().toISOString(),
          helpfulCount: 0,
        };

        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }));
      },

      toggleHelpful: (reviewId) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
          ),
        }));
      },

      getReviewsByProductId: (productId) => {
        return get().reviews.filter((r) => r.productId === productId);
      },
    }),
    {
      name: 'magmati-mart-reviews-store',
    }
  )
);
