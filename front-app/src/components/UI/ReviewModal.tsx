import { useState } from "react";
import { Button } from "./Button";
import { MaterialIcon } from "./MaterialIcon";
import { submitReview } from "../../services/reviewService";

type Props = {
  open: boolean;
  businessId: string;
  appointmentId: string;
  businessName: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function ReviewModal({
  open,
  businessId,
  appointmentId,
  businessName,
  onSuccess,
  onCancel,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit() {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReview(businessId, {
        appointmentId,
        rating,
        comment: comment.trim() || undefined,
      });
      onSuccess();
    } catch {
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const displayRating = hovered || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="space-y-1">
          <h2 className="font-bold text-[#111418] dark:text-white text-base">
            Leave a Review
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {businessName}
          </p>
        </div>

        {/* Star selector */}
        <div className="flex gap-1 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <MaterialIcon
                name={displayRating >= star ? "star" : "star_border"}
                className={
                  displayRating >= star ? "text-yellow-400" : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Share your experience (optional)"
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark px-3 py-2 text-sm text-[#111418] dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-right text-[10px] text-gray-400 -mt-3">
          {comment.length}/500
        </p>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <MaterialIcon name="error_outline" className="text-base" />
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel} className="flex-1" disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1"
            disabled={submitting || rating === 0}
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
