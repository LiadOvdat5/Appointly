import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { MaterialIcon } from "./MaterialIcon";
import { submitReview } from "../../services/reviewService";
import { useFocusTrap } from "../../hooks/useFocusTrap";

type Props = {
  open: boolean;
  businessId: string;
  appointmentId: string;
  businessName: string;
  onSuccess: () => void;
  onCancel: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
};

export function ReviewModal({
  open,
  businessId,
  appointmentId,
  businessName,
  onSuccess,
  onCancel,
  triggerRef,
}: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const errorId = useId();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { containerRef } = useFocusTrap<HTMLDivElement>({
    active: open,
    returnRef: triggerRef,
  });

  if (!open) return null;

  async function handleSubmit() {
    if (rating === 0) {
      setError(t("reviews.modal.errorNoRating"));
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
      setError(t("reviews.modal.errorSubmit"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }

  const displayRating = hovered || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={submitting}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="space-y-1">
          <h2
            id={titleId}
            className="font-bold text-[#111418] dark:text-white text-base"
          >
            {t("reviews.modal.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {businessName}
          </p>
        </div>

        {/* Star selector */}
        <div
          role="group"
          aria-label={t("reviews.modal.ratingLabel")}
          className="flex gap-1 justify-center"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="text-3xl transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-label={t(
                star > 1
                  ? "reviews.modal.starAriaLabel_other"
                  : "reviews.modal.starAriaLabel_one",
                { count: star },
              )}
              aria-pressed={rating === star}
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
        <div>
          <label
            htmlFor="review-comment"
            className="sr-only"
          >
            {t("reviews.modal.commentLabel")}
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t("reviews.modal.placeholder")}
            aria-describedby={error ? errorId : undefined}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark px-3 py-2 text-sm text-[#111418] dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-right text-[10px] text-gray-400 mt-1">
            {comment.length}/500
          </p>
        </div>

        {/* Error */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-sm text-red-500 flex items-center gap-1"
          >
            <MaterialIcon name="error_outline" className="text-base" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1"
            disabled={submitting}
          >
            {t("reviews.modal.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1"
            disabled={submitting || rating === 0}
            aria-describedby={error ? errorId : undefined}
          >
            {submitting
              ? t("reviews.modal.submitting")
              : t("reviews.modal.submitButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
