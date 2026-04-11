import { useTranslation } from "react-i18next";
import { Card } from "../UI/Card";
import { MaterialIcon } from "../UI/MaterialIcon";
import type { ReviewDTO } from "../../services/reviewService";

interface BusinessReviewsSectionProps {
  reviews: ReviewDTO[];
  reviewsLoading: boolean;
  reviewsHasMore: boolean;
  onLoadMore: () => void;
}

export function BusinessReviewsSection({
  reviews,
  reviewsLoading,
  reviewsHasMore,
  onLoadMore,
}: BusinessReviewsSectionProps) {
  const { t } = useTranslation();

  if (reviewsLoading && reviews.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-bold text-[#111418] dark:text-white mb-4">
          {t("publicBusiness.reviewsTitle")}
        </h2>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-bold text-[#111418] dark:text-white mb-4">
          {t("publicBusiness.reviewsTitle")}
        </h2>
        <Card className="p-8 flex flex-col items-center gap-2 text-center">
          <MaterialIcon name="rate_review" className="text-4xl text-gray-300 dark:text-gray-700" />
          <p className="text-sm text-gray-500">{t("publicBusiness.noReviewsYet")}</p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-[#111418] dark:text-white mb-4">
        {t("publicBusiness.reviewsTitle")}
      </h2>
      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <Card key={review.id} className="p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm text-[#111418] dark:text-white">
                  {review.customerName}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <MaterialIcon
                    key={s}
                    name={review.rating >= s ? "star" : "star_border"}
                    className={`text-base leading-none ${review.rating >= s ? "text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                "{review.comment}"
              </p>
            )}
          </Card>
        ))}

        {reviewsHasMore && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={reviewsLoading}
            className="w-full py-3 text-sm font-semibold text-primary hover:underline disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {reviewsLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            ) : (
              t("publicBusiness.loadMoreReviews")
            )}
          </button>
        )}
      </div>
    </section>
  );
}
