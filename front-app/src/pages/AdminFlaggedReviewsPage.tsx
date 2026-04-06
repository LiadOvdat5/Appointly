import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import {
  getFlaggedReviews,
  resolveReview,
  type AdminFlaggedReview,
  type ResolveAction,
} from "../services/adminService";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <MaterialIcon
          key={s}
          name="star"
          className={`text-sm leading-none ${
            s <= rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminFlaggedReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<AdminFlaggedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<{ id: string; action: ResolveAction } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null); // pending removal confirm

  useEffect(() => {
    getFlaggedReviews()
      .then(setReviews)
      .catch(() => setError("Failed to load flagged reviews."))
      .finally(() => setLoading(false));
  }, []);

  async function handleResolve(id: string, action: ResolveAction) {
    setActing({ id, action });
    try {
      await resolveReview(id, action);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Action failed — please try again.");
    } finally {
      setActing(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="px-4 py-6">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Back"
        >
          <MaterialIcon name="arrow_back" className="text-xl" />
        </button>
        <div>
          <h1 className="font-bold text-[#111418] dark:text-white text-xl leading-tight">
            Flagged Reviews
          </h1>
          <p className="text-xs text-gray-500">
            {loading ? "Loading…" : `${reviews.length} pending`}
          </p>
        </div>
      </div>

      <div>
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && reviews.length === 0 && !error && (
          <Card className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <MaterialIcon name="check_circle" className="text-3xl text-green-600" />
            </div>
            <p className="font-semibold text-[#111418] dark:text-white text-sm">
              No pending flags
            </p>
            <p className="text-xs text-gray-400">
              All reviews have been moderated — nothing to review.
            </p>
          </Card>
        )}

        {/* Review list */}
        {!loading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => {
              const isActing = acting?.id === review.id;
              const awaitingConfirm = confirmId === review.id;

              return (
                <Card key={review.id} className="p-5">
                  {/* Business + date */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#111418] dark:text-white truncate">
                        {review.businessName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Flagged {formatDate(review.flaggedAt)} · Review from{" "}
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Reviewer */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {review.customerName}
                    </span>
                  </p>

                  {/* Review comment */}
                  {review.comment && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 mb-3 italic">
                      "{review.comment}"
                    </p>
                  )}

                  {/* Flag reason */}
                  <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2 mb-4">
                    <MaterialIcon
                      name="flag"
                      className="text-base text-orange-500 shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      <span className="font-semibold">Owner's reason: </span>
                      {review.flagReason ?? "No reason provided"}
                    </p>
                  </div>

                  {/* Actions */}
                  {awaitingConfirm ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-gray-500 text-center">
                        Remove this review permanently? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => setConfirmId(null)}
                          disabled={isActing}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
                          onClick={() => handleResolve(review.id, "remove")}
                          isLoading={isActing}
                        >
                          Confirm Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleResolve(review.id, "dismiss")}
                        isLoading={acting?.id === review.id && acting.action === "dismiss"}
                        disabled={isActing}
                      >
                        <MaterialIcon name="flag_circle" className="text-base" />
                        Dismiss Flag
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
                        onClick={() => setConfirmId(review.id)}
                        disabled={isActing}
                      >
                        <MaterialIcon name="delete" className="text-base" />
                        Remove Review
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
