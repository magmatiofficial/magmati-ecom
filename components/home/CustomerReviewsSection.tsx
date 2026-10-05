'use client';

import React, { useState } from 'react';
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
  User,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useReviewStore } from '@/store/useReviewStore';
import { useProductStore } from '@/store/useProductStore';
import { formatBDT } from '@/lib/formatCurrency';

import { CustomDropdown } from '@/components/ui/CustomDropdown';

export function CustomerReviewsSection() {
  const { reviews, toggleHelpful, addReview } = useReviewStore();
  const { products } = useProductStore();

  const [showAllModal, setShowAllModal] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedMap, setLikedMap] = useState<{ [key: string]: boolean }>({});

  // Write Review Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [userNameInput, setUserNameInput] = useState<string>('');
  const [userLocationInput, setUserLocationInput] = useState<string>('');
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentInput, setCommentInput] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const handleLike = (reviewId: string) => {
    if (likedMap[reviewId]) return;
    toggleHelpful(reviewId);
    setLikedMap((prev) => ({ ...prev, [reviewId]: true }));
  };

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!userNameInput.trim()) {
      setFormError('Please enter your name');
      return;
    }
    if (!commentInput.trim()) {
      setFormError('Please enter your review comment');
      return;
    }

    const chosenProduct = products.find((p) => p.id === selectedProductId) || products[0];

    addReview({
      productId: chosenProduct ? chosenProduct.id : 'general-review',
      productName: chosenProduct ? chosenProduct.name : 'Store Experience',
      productImage: chosenProduct ? chosenProduct.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      productPrice: chosenProduct ? chosenProduct.price : 1000,
      userName: userNameInput.trim(),
      userLocation: userLocationInput.trim() || 'Bangladesh',
      rating: ratingInput,
      comment: commentInput.trim(),
      verified: false,
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowWriteModal(false);
      setUserNameInput('');
      setUserLocationInput('');
      setCommentInput('');
      setRatingInput(5);
    }, 1600);
  };

  // Featured top 4 latest product reviews for homepage grid
  const featuredReviews = reviews.slice(0, 4);

  // Filtered reviews for modal search
  const filteredModalReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.productName.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q)
    );
  });

  // Helper for initial bubble gradient
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-9">
      {/* Distinct Outer Card Container to give this section a unique premium feel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-[var(--color-surface-header)] text-white p-4 sm:p-7 lg:p-8 shadow-xl border border-zinc-800">
        
        {/* Decorative Top Ambient Light Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-5 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-primary/20 text-primary border border-primary/30">
                <Quote className="w-3.5 h-3.5 text-primary" />
              </span>
              <span className="text-eyebrow font-black uppercase tracking-widest text-primary font-sans">
                {'CUSTOMER EXPERIENCES BY PRODUCT'}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans flex items-center gap-2">
              <span>{'Real Buyer Reviews & Feedback'}</span>
              <Sparkles className="w-4 h-4 text-brand-gold hidden sm:inline-block" />
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl font-sans">
              {'Unfiltered, real feedback submitted directly by customers after using our items'}
            </p>
          </div>

          {/* Action Row: Overall Rating Badge + Write Review + View All Modal */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            
            {/* Aggregate Score Tag */}
            <div className="flex items-center gap-2 bg-zinc-800/90 px-3.5 py-2 rounded-2xl border border-zinc-700/80 shadow-2xs">
              <div className="flex items-center gap-0.5 text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <span className="font-mono text-xs font-bold text-white">
                4.9 / 5.0
              </span>
              <span className="text-2xs text-zinc-400 hidden sm:inline">
                ({reviews.length})
              </span>
            </div>

            {/* Write Review Button */}
            <button
              type="button"
              onClick={() => {
                if (products.length > 0 && !selectedProductId) {
                  setSelectedProductId(products[0].id);
                }
                setShowWriteModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-primary hover:bg-primary-hover text-app-inverse text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{'Write a Review'}</span>
            </button>

            {/* View All Button */}
            <button
              type="button"
              onClick={() => setShowAllModal(true)}
              className="text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 px-3.5 py-2 rounded-2xl border border-zinc-700 transition-colors cursor-pointer"
            >
              {`All Reviews (${reviews.length})`}
            </button>
          </div>
        </div>

        {/* 4 Distinct Elevated Review Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-zinc-800/60 hover:bg-zinc-800/90 rounded-2xl p-4 border border-zinc-700/60 hover:border-zinc-500/80 transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Product Direct Link Thumbnail */}
                <Link
                  href={`/product/${r.productId}`}
                  className="flex items-center gap-2.5 p-2 bg-zinc-900/80 hover:bg-zinc-950 rounded-xl mb-3.5 border border-zinc-700/50 transition-colors group/prod"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-zinc-700 relative">
                    <Image
                      src={r.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                      alt={r.productName}
                      fill
                      sizes="40px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-eyebrow font-bold text-zinc-200 group-hover/prod:text-brand-gold truncate transition-colors">
                      {r.productName}
                    </p>
                    <p className="text-2xs text-primary font-mono font-bold">
                      {formatBDT(r.productPrice)}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover/prod:text-brand-gold shrink-0" />
                </Link>

                {/* Rating Stars & Timestamp */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-0.5">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>
                  <span className="text-2xs text-zinc-400 font-mono">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-4 mb-4 italic">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              {/* Reviewer Footprint (Clean Name WITHOUT Checkmark Ticks as requested) */}
              <div className="pt-3 border-t border-zinc-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary text-app-inverse font-bold text-2xs flex items-center justify-center shrink-0 shadow-xs">
                    {getInitials(r.userName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[120px]">
                      {r.userName}
                    </p>
                    <p className="text-2xs text-zinc-400 truncate max-w-[100px]">
                      {r.userLocation}
                    </p>
                  </div>
                </div>

                {/* Helpful Like Action */}
                <button
                  type="button"
                  onClick={() => handleLike(r.id)}
                  className={`flex items-center gap-1 text-2xs font-mono px-2 py-1 rounded-xl border transition-all cursor-pointer ${
                    likedMap[r.id]
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-700 hover:bg-zinc-900 hover:text-white'
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

                {/* 3. Name & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{'Your Name:'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userNameInput}
                      onChange={(e) => setUserNameInput(e.target.value)}
                      placeholder={'e.g., Tanvir Hasan'}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-primary focus:outline-hidden"
                    />
                  </div>

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
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-app-inverse transition-colors cursor-pointer shadow-md"
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
