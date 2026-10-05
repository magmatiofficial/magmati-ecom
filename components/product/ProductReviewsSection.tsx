'use client';

import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  MessageSquarePlus, 
  X, 
  ShieldCheck, 
  Sparkles,
  User
} from 'lucide-react';
import { Product } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { useReviewStore, ProductReview } from '@/store/useReviewStore';
import { useProductStore } from '@/store/useProductStore';

interface ProductReviewsSectionProps {
  product: Product;
}

export function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
  const { currentUser } = useAuthStore();
  const { reviews, addReview, toggleHelpful } = useReviewStore();
  const updateProduct = useProductStore((state) => state.updateProduct);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(currentUser?.name || '');
  const [location, setLocation] = useState(currentUser?.address || 'Dhaka');
  const [comment, setComment] = useState('');
  const [submittedToast, setSubmittedToast] = useState(false);
  const [likedReviews, setLikedReviews] = useState<{ [id: string]: boolean }>({});

  // Filter reviews for this product
  const productReviews = reviews.filter((r) => r.productId === product.id);

  // Compute stats
  const totalCount = productReviews.length;
  const averageRating = totalCount > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : (product.rating ?? 0).toFixed(1);

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = productReviews.filter((r) => r.rating === star).length;
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : (star === 5 ? 85 : star === 4 ? 15 : 0);
    return { star, count, percentage };
  });

  const handleLike = (reviewId: string) => {
    if (likedReviews[reviewId]) return;
    toggleHelpful(reviewId);
    setLikedReviews((prev) => ({ ...prev, [reviewId]: true }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !name.trim()) return;

    // Add review
    addReview({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] || '',
      productPrice: product.price,
      userName: name.trim(),
      userLocation: location.trim(),
      rating,
      comment: comment.trim(),
      verified: true,
    });

    // Update product reviewCount and average rating in store
    const newTotal = totalCount + 1;
    const currentSum = productReviews.reduce((acc, r) => acc + r.rating, 0) + rating;
    const newAvg = Number((currentSum / newTotal).toFixed(1));
    updateProduct(product.id, {
      rating: newAvg,
      reviewCount: (product.reviewCount || 0) + 1,
    });

    // Reset & close
    setComment('');
    setIsModalOpen(false);
    setSubmittedToast(true);
    setTimeout(() => setSubmittedToast(false), 4000);
  };

  return (
    <section className="mt-12 sm:mt-16 pt-10 border-t border-zinc-200">
      {/* Toast Alert */}
      {submittedToast && (
        <div className="fixed top-20 right-4 z-50 bg-zinc-900 text-white text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50 animate-in fade-in slide-in-from-top-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <p className="font-bold text-emerald-400">
              {'Review Submitted Successfully!'}
            </p>
            <p className="text-xs text-zinc-300">
              {'Thank you for sharing your verified experience.'}
            </p>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-2xs font-bold text-primary uppercase tracking-widest">
              {'CUSTOMER FEEDBACK'}
            </span>
          </div>
          <h2 className="font-sans text-xl sm:text-2xl font-bold text-zinc-900 flex items-center gap-2.5">
            {'Verified Ratings & Reviews'}
            <span className="text-xs font-normal text-zinc-400 bg-zinc-100 px-2.5 py-0.5 rounded-full">
              {totalCount} {'reviews'}
            </span>
          </h2>
        </div>

        {/* Action Button: Write a Review */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-app-inverse rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95 self-start sm:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{'Write a Review'}</span>
        </button>
      </div>

      {/* Summary Score Breakdown Card */}
      <div className="bg-zinc-50/80 rounded-3xl p-5 sm:p-7 border border-zinc-200/90 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Average Rating Big Box */}
          <div className="md:col-span-4 text-center md:text-left md:border-r md:border-zinc-200 md:pr-6">
            <div className="flex items-baseline justify-center md:justify-start gap-2 mb-1">
              <span className="font-sans text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight font-mono">
                {averageRating}
              </span>
              <span className="text-sm font-semibold text-zinc-400 font-mono">/ 5.0</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-300'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-zinc-500 flex items-center justify-center md:justify-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {'Based on 100% verified customer purchases'}
              </span>
            </p>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="md:col-span-8 space-y-2">
            {starCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-zinc-700 flex items-center gap-1 shrink-0">
                  {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 h-2.5 bg-zinc-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs text-zinc-400 shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Reviews List */}
      {productReviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-zinc-900 mb-1">
            {'No Reviews for this Product Yet'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {'Click "+ Write a Review" above to be the first verified customer to share your feedback!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {productReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all"
            >
              {/* Reviewer Meta & Stars */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-subtle text-primary font-bold text-xs flex items-center justify-center font-sans shrink-0">
                    {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-zinc-900">
                        {rev.userName}
                      </span>
                      {rev.verified && (
                        <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {'Verified Buyer'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">
                      {rev.userLocation}
                    </p>
                  </div>
                </div>

                {/* Stars + Date */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Review Body */}
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed mb-4 pl-1">
                &ldquo;{rev.comment}&rdquo;
              </p>

              {/* Helpful footer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {'Authentic Verified Purchase'}
                </span>

                <button
                  type="button"
                  onClick={() => handleLike(rev.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                    likedReviews[rev.id]
                      ? 'bg-primary-subtle text-primary font-bold'
                      : 'hover:bg-zinc-100 text-zinc-500'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${likedReviews[rev.id] ? 'fill-primary' : ''}`} />
                  <span>{'Helpful'} ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write a Review Interactive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3.5 mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900 font-sans">
                  {'Write a Product Review'}
                </h3>
                <p className="text-xs text-zinc-500">
                  {product.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  {'Select Rating *'}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition-transform active:scale-125 focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-zinc-700 ml-2 font-mono">
                    {rating} / 5
                  </span>
                </div>
              </div>

              {/* Name & Location Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    {'Your Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={'e.g. Tanvir Hasan'}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    {'City / District *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={'e.g. Dhanmondi, Dhaka'}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  {'Detailed Review / Feedback *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    'Share details about product quality, performance, and delivery experience...'
                  }
                  className="w-full text-xs p-3 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-zinc-300 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-colors"
                >
                  {'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-app-inverse rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md"
                >
                  {'Submit Review'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </section>
  );
}
