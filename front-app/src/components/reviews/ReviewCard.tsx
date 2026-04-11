import { useTranslation } from "react-i18next";
import type { ReviewDTO } from "../../services/reviewService";
import { Card } from "../UI/Card";
import { MaterialIcon } from "../UI/MaterialIcon";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ReviewCardProps {
  review: ReviewDTO;
  onFlag: (id: string) => void;
}

export function ReviewCard({ review, onFlag }: ReviewCardProps) {
  const { t } = useTranslation();

  const cardBorder = review.isFlagged
    ? "border-orange-200 dark:border-orange-800"
    : review.isFlagDismissed
    ? "border-blue-100 dark:border-blue-900/40"
    : "";

  const flagButtonDisabled = review.isFlagged || review.isFlagDismissed;
  const flagButtonTitle = review.isFlagged
    ? t("reviews.flag.alreadyFlagged")
    : review.isFlagDismissed
    ? t("reviews.flag.dismissedNote")
    : t("reviews.flag.flagAsInappropriate");

  return (
    <Card className={`p-5 space-y-3 ${cardBorder}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-[#111418] dark:text-white">
              {review.customerName}
            </span>
            {review.isFlagged && (
              <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full px-2 py-0.5 shrink-0">
                <MaterialIcon name="flag" className="text-xs leading-none" />
                {t("reviews.badge.flagged")}
              </span>
            )}
            {review.isFlagDismissed && (
              <span className="flex items-center gap-1 text-xs font-semibold text-blue-500 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5 shrink-0">
                <MaterialIcon name="verified_user" className="text-xs leading-none" />
                {t("reviews.badge.flagDismissed")}
              </span>
            )}
          </div>

          {/* Service + date */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            {review.serviceName && (
              <span className="flex items-center gap-1 text-xs text-primary font-medium">
                <MaterialIcon name="content_cut" className="text-xs leading-none" />
                {review.serviceName}
              </span>
            )}
            <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
          </div>
        </div>

        {/* Stars + flag button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <MaterialIcon
                key={s}
                name={review.rating >= s ? "star" : "star_border"}
                className={`text-base leading-none ${review.rating >= s ? "text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={flagButtonDisabled}
            onClick={() => !flagButtonDisabled && onFlag(review.id)}
            title={flagButtonTitle}
            className={`p-1.5 rounded-lg transition-colors ${
              review.isFlagged
                ? "text-orange-400 cursor-not-allowed"
                : review.isFlagDismissed
                ? "text-blue-300 dark:text-blue-700 cursor-not-allowed"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            }`}
          >
            <MaterialIcon
              name={review.isFlagged ? "flag" : review.isFlagDismissed ? "verified_user" : "outlined_flag"}
              className="text-base leading-none"
            />
          </button>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          "{review.comment}"
        </p>
      )}

      {/* Status notes */}
      {review.isFlagged && (
        <p className="text-xs text-orange-500 flex items-center gap-1 pt-2 border-t border-orange-100 dark:border-orange-900/30">
          <MaterialIcon name="info" className="text-sm leading-none" />
          {t("reviews.flag.pendingNote")}
        </p>
      )}
      {review.isFlagDismissed && (
        <p className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1 pt-2 border-t border-blue-100 dark:border-blue-900/30">
          <MaterialIcon name="verified_user" className="text-sm leading-none" />
          {t("reviews.flag.dismissedNote")}
        </p>
      )}
    </Card>
  );
}
