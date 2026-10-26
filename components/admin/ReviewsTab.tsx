'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle2, Trash2, RefreshCcw, Search, AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/store/useToastStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatBDT } from '@/lib/formatCurrency';
import Image from 'next/image';

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  userName: string;
  userLocation: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
  helpfulCount: number;
}

export function ReviewsTab() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews?limit=300');
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setError(data.error || 'Failed to fetch reviews');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = (review: AdminReview) => {
    setConfirmDialog({
      open: true,
      title: `Delete Review by ${review.userName}`,
      message: `Are you sure you want to permanently delete this review for "${review.productName}"?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const token = await auth.currentUser?.getIdToken();
          const headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(`/api/reviews?id=${encodeURIComponent(review.id)}`, {
            method: 'DELETE',
            headers,
          });
          const data = await res.json();
          if (data.success) {
            toast.success('Review deleted successfully');
            setReviews((prev) => prev.filter((r) => r.id !== review.id));
            setConfirmDialog((prev) => ({ ...prev, open: false }));
          } else {
            toast.error(data.error || 'Failed to delete review');
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Failed to delete review';
          toast.error(errMsg);
        } finally {
          setIsConfirmLoading(false);
        }
      },
    });
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === 'all' || r.rating.toString() === ratingFilter;
    const matchesVerified =
      verifiedFilter === 'all' ||
      (verifiedFilter === 'verified' && r.verified) ||
      (verifiedFilter === 'unverified' && !r.verified);

    return matchesSearch && matchesRating && matchesVerified;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">
            {'Product Reviews & Feedback'}
          </h2>
          <p className="text-xs text-zinc-500">
            {`Manage customer reviews, moderate comments, and view verified feedback (${reviews.length} total)`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReviews()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{'Refresh'}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={'Search by product, customer name or review text...'}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-primary"
          >
            <option value="all">{'All Ratings'}</option>
            <option value="5">{'5 Stars'}</option>
            <option value="4">{'4 Stars'}</option>
            <option value="3">{'3 Stars'}</option>
            <option value="2">{'2 Stars'}</option>
            <option value="1">{'1 Star'}</option>
          </select>

          {/* Verified Filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-primary"
          >
            <option value="all">{'All Status'}</option>
            <option value="verified">{'Verified Only'}</option>
            <option value="unverified">{'Not Verified'}</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading && reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-zinc-200 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-zinc-500 font-medium">{'Loading reviews...'}</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
          <button
            type="button"
            onClick={() => fetchReviews()}
            className="px-4 py-2 bg-primary text-app-inverse rounded-xl text-xs font-bold shadow-xs hover:bg-primary-hover"
          >
            {'Retry'}
          </button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-zinc-200 text-center space-y-2">
          <p className="text-sm font-bold text-zinc-900">{'No reviews found'}</p>
          <p className="text-xs text-zinc-500">{'Try adjusting your search or filter criteria.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-2xs uppercase tracking-wider text-zinc-500 font-bold">
                  <th className="py-3.5 px-4">{'Product'}</th>
                  <th className="py-3.5 px-4">{'Customer'}</th>
                  <th className="py-3.5 px-4">{'Rating'}</th>
                  <th className="py-3.5 px-4 max-w-xs">{'Comment'}</th>
                  <th className="py-3.5 px-4">{'Date'}</th>
                  <th className="py-3.5 px-4 text-right">{'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 text-xs">
                {filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 shrink-0 relative border border-zinc-200">
                          {r.productImage ? (
                            <Image
                              src={r.productImage}
                              alt={r.productName}
                              fill
                              sizes="36px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 truncate max-w-xs" title={r.productName}>
                            {r.productName || r.productId}
                          </p>
                          <p className="text-2xs font-mono text-zinc-500 font-medium">
                            {formatBDT(r.productPrice)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-900">{r.userName}</div>
                      <div className="text-2xs text-zinc-500">{r.userLocation || 'Unknown'}</div>
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {'Verified'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-2xs font-mono text-zinc-500 font-bold mt-0.5 block">
                        {r.rating}.0 / 5.0
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-zinc-700 line-clamp-2 leading-relaxed" title={r.comment}>
                        &ldquo;{r.comment}&rdquo;
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500 font-mono text-2xs">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmLabel={confirmDialog.confirmLabel || 'Delete'}
        cancelLabel={confirmDialog.cancelLabel || 'Cancel'}
        loading={isConfirmLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
