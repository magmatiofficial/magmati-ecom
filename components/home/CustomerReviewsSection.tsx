'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Star, 
  ThumbsUp, 
  X, 
  ExternalLink,
  Search,
  MessageSquarePlus,
  Quote,
  Check,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useReviewStore } from '@/store/useReviewStore';
import { useProducts } from '@/hooks/useProducts';
import { formatBDT } from '@/lib/formatCurrency';
import { useAuthStore } from '@/store/useAuthStore';

import { CustomDropdown } from '@/components/ui/CustomDropdown';

// Helper for initial bubble gradient
const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export function CustomerReviewsSection() {
  const { reviews, toggleHelpful, addReview, fetchReviews } = useReviewStore();
  const { products } = useProducts();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const [showAllModal, setShowAllModal] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedMap, setLikedMap] = useState<{ [key: string]: boolean }>({});

  // Write Review Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [userLocationInput, setUserLocationInput] = useState<string>('');
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentInput, setCommentInput] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (reviews.length === 0) return null;

  const handleLike = async (reviewId: string) => {
    if (likedMap[reviewId]) return;
    if (!currentUser) return;
    await toggleHelpful(reviewId);
    setLikedMap((prev) => ({ ...prev, [reviewId]: true }));
  };

  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!currentUser) {
      setFormError('Please sign in to write a review.');
      return;
    }
    if (!selectedProductId) {
      setFormError('Please select a product');
      return;
    }
    if (commentInput.trim().length < 5) {
      setFormError('Review must be at least 5 characters');
      return;
    }

    const chosenProduct = products.find((p) => p.id === selectedProductId);
    if (!chosenProduct) {
      setFormError('Product not found');
      return;
    }

    const result = await addReview({
      productId: chosenProduct.id,
      productName: chosenProduct.name,
      productImage: chosenProduct.images[0] || '',
      productPrice: chosenProduct.price,
      userName: currentUser.name || '',
      userLocation: userLocationInput.trim(),
      rating: ratingInput,
      comment: commentInput.trim(),
      verified: false,
    });

    if (!result.ok) {
      setFormError(result.error || 'Failed to submit review.');
      return;
    }

    await fetchReviews();
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowWriteModal(false);
      setUserLocationInput('');
      setCommentInput('');
      setRatingInput(5);
    }, 1600);
  };

  // Featured top 4 latest product reviews for homepage grid
  const featuredReviews = sortedReviews.slice(0, 4);

  // Filtered reviews for modal search
  const filteredModalReviews = sortedReviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.productName.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q)
    );
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Distinct Outer Card Container - Light Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-border shadow-sm p-3 sm:p-5 lg:p-6">
        
        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <Quote className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl lg:text-2xl font-black text-text-main tracking-tight font-sans leading-tight flex items-center gap-2">
                <span>{'Real Buyer Reviews & Feedback'}</span>
                <Sparkles className="w-4 h-4 text-brand-gold hidden sm:inline-block" />
              </h2>
              <p className="text-2xs sm:text-xs text-text-muted mt-0.5 font-sans">
                {'Unfiltered, real feedback submitted directly by customers after using our items'}
              </p>
            </div>
          </div>

          {/* Action Row: Overall Rating Badge + Write Review + View All Modal */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto shrink-0">
            
            {/* Aggregate Score Tag */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <div className="flex items-center gap-0.5 text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <span className="font-mono text-xs font-bold text-text-main">
                {averageRating} / 5.0
              </span>
              <span className="text-2xs text-text-muted hidden sm:inline">
                ({reviews.length})
              </span>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Write Review Button */}
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    setFormError('Please sign in to write a review.');
                    setShowWriteModal(true);
                    return;
                  }
                  setShowWriteModal(true);
                }}
                className="inline-flex flex-1 md:flex-none items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-primary hover:bg-primary-hover text-app-inverse text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>{'Write a Review'}</span>
              </button>

              {/* View All Button */}
              <button
                type="button"
                onClick={() => setShowAllModal(true)}
                className="inline-flex flex-1 md:flex-none items-center justify-center text-xs font-bold text-text-main bg-surface hover:bg-surface-hover border border-border px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                {`All Reviews (${reviews.length})`}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Distinct Elevated Review Cards - Light Theme */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {featuredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-surface rounded-2xl p-4 sm:p-5 border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Product Direct Link Thumbnail */}
                <Link
                  href={`/product/${r.productId}`}
                  className="flex items-center gap-3 mb-3 group/prod"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-white shrink-0 border border-border relative">
                    <Image
                      src={r.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                      alt={r.productName}
                      fill
                      sizes="56px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold normal-case text-text-main group-hover/prod:text-primary line-clamp-2 leading-snug transition-colors">
                      {r.productName}
                    </p>
                    <p className="text-xs text-primary font-mono font-bold mt-1.5">
                      {formatBDT(r.productPrice)}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-text-subtle group-hover/prod:text-primary shrink-0" />
                </Link>

                {/* Rating Stars & Timestamp */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted font-mono">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-base sm:text-lg text-text-main leading-relaxed font-sans line-clamp-4 mb-6">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              {/* Reviewer Footprint */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-2xs flex items-center justify-center shrink-0 border border-primary/20">
                    {getInitials(r.userName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-text-main truncate max-w-[130px] sm:max-w-[200px]">
                      {r.userName}
                    </p>
                    <p className="text-xs text-text-muted truncate max-w-[130px] sm:max-w-[200px]">
                      {r.userLocation}
                    </p>
                  </div>
                </div>

                {/* Helpful Like Action */}
                <button
                  type="button"
                  onClick={() => handleLike(r.id)}
                  className={`flex items-center gap-1 text-2xs font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                    likedMap[r.id]
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                      : 'bg-transparent text-text-subtle border-border hover:text-text-main hover:bg-surface-subtle'
                  }`}
                  aria-label="Mark review as helpful"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{r.helpfulCount}</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* WRITE REVIEW MODAL */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-150 text-zinc-900">
            
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2 font-sans">
                  <MessageSquarePlus className="w-5 h-5 text-primary" />
                  <span>{'Write a Product Review'}</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {'Share your real experience with fellow buyers'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWriteModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-zinc-900">
                  {'Thank You! Review Added Successfully'}
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  {'Your feedback is now visible in the reviews section...'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleWriteSubmit} className="space-y-4">
                
                {formError && (
                  <div className="p-2.5 rounded-xl bg-primary-subtle border border-primary/20 text-primary text-xs font-medium">
                    {formError}
                  </div>
                )}

                {/* 1. Product Selection */}
                <CustomDropdown
                  label="Select Product:"
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.name} (৳${p.price})`,
                  }))}
                  triggerClassName="h-10"
                />

                {/* 2. Rating Star Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    {'Your Rating:'}
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (hoverRating || ratingInput) >= star
                              ? 'fill-brand-gold text-brand-gold'
                              : 'text-zinc-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-zinc-600 ml-2">
                      {hoverRating || ratingInput} / 5
                    </span>
                  </div>
                </div>

                {/* 3. Location */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{'Location:'}</span>
                  </label>
                  <input
                    type="text"
                    value={userLocationInput}
                    onChange={(e) => setUserLocationInput(e.target.value)}
                    placeholder={'e.g., Dhaka'}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-primary focus:outline-hidden"
                  />
                </div>

                {/* 4. Review Comment */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    {'Your Detailed Review:'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={'Describe product quality, fitting or delivery speed...'}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-primary focus:outline-hidden resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowWriteModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    {'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={!currentUser}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-app-inverse transition-colors cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {'Submit Review'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* FULL CUSTOMER REVIEWS WALL MODAL */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[85dvh] flex flex-col text-zinc-900">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 font-sans flex items-center gap-2">
                  <Quote className="w-5 h-5 text-primary" />
                  <span>{'All Customer Reviews'}</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  {'Browse through all real customer ratings and opinions'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input inside Modal */}
            <div className="relative mb-3.5">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={'Search by product or review text...'}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Scrollable Reviews List inside Modal */}
            <div className="overflow-y-auto space-y-3 pr-2 flex-1">
              {filteredModalReviews.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  {'No matching reviews found'}
                </div>
              ) : (
                filteredModalReviews.map((r) => (
                  <div key={r.id} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
                    
                    {/* Top Row: Product Link + Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 pb-2.5 border-b border-zinc-200/80">
                      <Link
                        href={`/product/${r.productId}`}
                        onClick={() => setShowAllModal(false)}
                        className="flex items-center gap-2.5 text-xs font-bold text-zinc-900 hover:text-primary transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0 relative border border-zinc-200">
                          <Image
                            src={r.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                            alt={r.productName}
                            fill
                            sizes="32px"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="truncate max-w-xs sm:max-w-md">
                          {r.productName}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
                      </Link>

                      <div className="flex items-center gap-1 text-brand-gold shrink-0">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                        ))}
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-xs text-zinc-700 leading-relaxed mb-3 font-sans italic">
                      &ldquo;{r.comment}&rdquo;
                    </p>

                    {/* Bottom Row: User Meta (WITHOUT checkmark ticks) + Date */}
                    <div className="flex items-center justify-between text-eyebrow text-zinc-500 pt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 text-white font-bold text-2xs flex items-center justify-center shrink-0">
                          {getInitials(r.userName)}
                        </div>
                        <span className="font-bold text-zinc-900">
                          {r.userName}
                        </span>
                        <span>• {r.userLocation}</span>
                      </div>

                      <span className="font-mono text-zinc-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3.5 mt-2 border-t border-zinc-200 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-sans">
                {`Showing ${filteredModalReviews.length} reviews`}
              </span>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="px-6 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {'Close'}
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
