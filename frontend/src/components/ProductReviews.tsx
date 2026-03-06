'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { StarIcon } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  createReview,
  deleteReview,
  fetchReviews,
  type Review,
  type ReviewListData,
  type ReviewSummary,
  toggleReviewHelpful,
} from '@/lib/api';

// ─── Star Rating Display ─────────────────────────────────────────────

function StarRatingDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}
        />
      ))}
    </div>
  );
}

// ─── Star Rating Input ────────────────────────────────────────────────

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded"
          aria-label={`${star} sao`}
        >
          <StarIcon
            size={28}
            className={
              star <= (hovered || value) ? 'text-amber-400 drop-shadow-sm' : 'text-gray-200'
            }
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-[var(--text-muted)] self-center">{value}/5</span>
      )}
    </div>
  );
}

// ─── Rating Summary ───────────────────────────────────────────────────

function RatingSummary({ summary }: { summary: ReviewSummary }) {
  const total = summary.reviewCount || 1; // prevent division by zero

  return (
    <div className="flex items-start gap-8 p-6 rounded-2xl bg-pink-50/50 border border-pink-100">
      <div className="text-center">
        <div className="text-4xl font-bold text-[var(--text-primary)]">
          {summary.avgRating.toFixed(1)}
        </div>
        <StarRatingDisplay rating={summary.avgRating} size={16} />
        <div className="text-sm text-[var(--text-muted)] mt-1">{summary.reviewCount} đánh giá</div>
      </div>
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.distribution[star as keyof typeof summary.distribution] || 0;
          const percentage = Math.round((count / total) * 100);

          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)] w-6">{star}★</span>
              <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-[var(--text-muted)] w-10">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Image Upload Preview ─────────────────────────────────────────────

function ImageUploadPreview({
  files,
  previewUrls,
  onRemove,
}: {
  files: File[];
  previewUrls: string[];
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {files.map((file, index) => (
        <div key={`${file.name}-${index}`} className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrls[index]}
            alt={`Preview ${index + 1}`}
            className="w-20 h-20 object-cover rounded-lg border border-pink-200"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Xóa ảnh ${index + 1}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Review Form ──────────────────────────────────────────────────────

function ReviewForm({
  productId,
  onReviewCreated,
}: {
  productId: string;
  onReviewCreated: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Manage Object URL lifecycle to prevent memory leaks (P2-6)
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const remaining = 3 - images.length;

    if (selectedFiles.length > remaining) {
      setError(`Chỉ được tải lên tối đa 3 ảnh (còn ${remaining} ảnh)`);
      return;
    }

    // Client-side validation: 5MB per file
    const oversized = selectedFiles.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      setError('Mỗi ảnh không được vượt quá 5MB');
      return;
    }

    setError('');
    const newUrls = selectedFiles.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...selectedFiles]);
    setPreviewUrls((prev) => [...prev, ...newUrls]);
    e.target.value = ''; // reset input
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Đánh giá phải có ít nhất 10 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview(productId, { rating, comment: comment.trim() }, images);
      setRating(0);
      setComment('');
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setImages([]);
      setPreviewUrls([]);
      onReviewCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-pink-100 bg-white">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Viết đánh giá của bạn
      </h3>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
          Đánh giá *
        </label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label
          htmlFor="review-comment"
          className="text-sm font-medium text-[var(--text-secondary)] mb-2 block"
        >
          Nhận xét * <span className="text-[var(--text-muted)] font-normal">(10-1000 ký tự)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <div className="text-xs text-[var(--text-muted)] text-right mt-1">
          {comment.length}/1000
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
          Hình ảnh{' '}
          <span className="text-[var(--text-muted)] font-normal">(tối đa 3 ảnh, 5MB/ảnh)</span>
        </label>
        {images.length > 0 && (
          <div className="mb-2">
            <ImageUploadPreview
              files={images}
              previewUrls={previewUrls}
              onRemove={handleRemoveImage}
            />
          </div>
        )}
        {images.length < 3 && (
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-pink-300 rounded-xl text-sm text-pink-500 hover:bg-pink-50 cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm ảnh
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>
    </form>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────

function ReviewCard({
  review,
  currentUserId,
  onDelete,
  onToggleHelpful,
}: {
  review: Review;
  currentUserId: string | null;
  onDelete: (reviewId: string) => void;
  onToggleHelpful: (reviewId: string) => void;
}) {
  const isOwner = currentUserId === review.user._id;
  const initials = review.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const [showFullImage, setShowFullImage] = useState<string | null>(null);

  return (
    <>
      <div className="p-5 rounded-2xl border border-pink-100 hover:border-pink-200 transition-colors">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {review.user.avatar ? (
              <Image
                src={review.user.avatar}
                alt={review.user.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-semibold text-[var(--text-primary)]">{review.user.name}</span>
              <StarRatingDisplay rating={review.rating} size={14} />
              <span className="text-sm text-[var(--text-muted)]">
                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>

            <p className="text-[var(--text-secondary)] mb-3">{review.comment}</p>

            {/* Review Images */}
            {review.images.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {review.images.map((img) => (
                  <button
                    key={img.publicId}
                    type="button"
                    onClick={() => setShowFullImage(img.url)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded-lg"
                  >
                    <Image
                      src={img.url}
                      alt="Review image"
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg border border-pink-100 hover:border-pink-300 transition-colors cursor-pointer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onToggleHelpful(review._id)}
                className={`text-sm transition-colors ${
                  review.isLiked
                    ? 'text-pink-500 font-medium'
                    : 'text-[var(--text-muted)] hover:text-pink-500'
                }`}
              >
                👍 Hữu ích ({review.helpfulCount})
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => onDelete(review._id)}
                  className="text-sm text-[var(--text-muted)] hover:text-red-500 transition-colors"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(null)}
          onKeyDown={(e) => e.key === 'Escape' && setShowFullImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh đầy đủ"
          tabIndex={-1}
          ref={(el) => el?.focus()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowFullImage(null);
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center text-xl transition-colors"
            aria-label="Đóng"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={showFullImage}
            alt="Full size review image"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ─── Main ProductReviews Component ────────────────────────────────────

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviewData, setReviewData] = useState<ReviewListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasOwnReview, setHasOwnReview] = useState(false);

  const loadReviews = useCallback(
    async (pageNum = 1) => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fetchReviews(productId, {
          page: pageNum,
          limit: 10,
        });
        setReviewData(data);
        setPage(pageNum);

        // Use server-provided flag for accurate cross-page check
        if (user && data.summary) {
          setHasOwnReview(data.summary.userHasReviewed);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải đánh giá');
      } finally {
        setIsLoading(false);
      }
    },
    [productId, user]
  );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleReviewCreated = () => {
    loadReviews(1); // Reload from first page
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await deleteReview(reviewId);
      loadReviews(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa đánh giá');
    }
  };

  const handleToggleHelpful = async (reviewId: string) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }

    try {
      const result = await toggleReviewHelpful(reviewId);

      // Optimistic update
      setReviewData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  helpfulCount: result.helpfulCount,
                  isLiked: result.isLiked,
                }
              : r
          ),
        };
      });
    } catch {
      // Revert on failure
      loadReviews(page);
    }
  };

  if (isLoading && !reviewData) {
    return <div className="text-center py-12 text-[var(--text-muted)]">Đang tải đánh giá...</div>;
  }

  if (error && !reviewData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => loadReviews()} className="text-pink-500 font-medium hover:underline">
          Thử lại
        </button>
      </div>
    );
  }

  const summary = reviewData?.summary;
  const reviews = reviewData?.reviews || [];
  const pagination = reviewData?.pagination;
  const canReview = summary?.canReview ?? false;
  const hasDeliveredPurchase = summary?.hasDeliveredPurchase ?? false;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {summary && summary.reviewCount > 0 && <RatingSummary summary={summary} />}

      {/* Review Form or Login Prompt */}
      {user ? (
        hasOwnReview ? (
          <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-100 text-center text-[var(--text-secondary)]">
            Bạn đã đánh giá sản phẩm này
          </div>
        ) : canReview ? (
          <ReviewForm productId={productId} onReviewCreated={handleReviewCreated} />
        ) : (
          <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-100 text-center text-[var(--text-secondary)]">
            {hasDeliveredPurchase
              ? 'Bạn chưa thể đánh giá sản phẩm này'
              : 'Chỉ khách đã mua và nhận hàng mới có thể đánh giá sản phẩm'}
          </div>
        )
      ) : (
        <div className="p-6 rounded-2xl border border-pink-100 bg-white text-center">
          <p className="text-[var(--text-secondary)] mb-3">Đăng nhập để đánh giá sản phẩm</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-pink-200 transition-all"
          >
            Đăng nhập
          </Link>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={user?.id || null}
              onDelete={handleDelete}
              onToggleHelpful={handleToggleHelpful}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--text-muted)]">
          Chưa có đánh giá nào. Hãy là người đầu tiên!
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => loadReviews(p)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-pink-500 text-white'
                  : 'text-[var(--text-secondary)] hover:bg-pink-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
