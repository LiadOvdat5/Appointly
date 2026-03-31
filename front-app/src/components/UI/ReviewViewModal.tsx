import { useTranslation } from "react-i18next";
import { MaterialIcon } from "./MaterialIcon";
import { Button } from "./Button";
import type { ReviewDTO } from "../../services/reviewService";

type Props = {
  open: boolean;
  review: ReviewDTO;
  onClose: () => void;
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcon
          key={star}
          name={rating >= star ? "star" : "star_border"}
          className={`text-xl ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export function ReviewViewModal({ open, review, onClose }: Props) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-bold text-[#111418] dark:text-white text-base">
              {t("reviews.viewModal.title")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {review.customerName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={t("reviews.viewModal.closeAriaLabel")}
          >
            <MaterialIcon name="close" className="text-xl text-gray-500" />
          </button>
        </div>

        {/* Stars */}
        <StarDisplay rating={review.rating} />

        {/* Comment */}
        {review.comment ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            "{review.comment}"
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">{t("reviews.viewModal.noComment")}</p>
        )}

        {/* Date */}
        <p className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <Button variant="ghost" onClick={onClose} className="w-full">
          {t("reviews.viewModal.close")}
        </Button>
      </div>
    </div>
  );
}
