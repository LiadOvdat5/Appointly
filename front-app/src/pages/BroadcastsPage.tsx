import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getBroadcasts,
  getBroadcastStatus,
  type BroadcastDTO,
  type BroadcastStatusDTO,
} from "../services/broadcastService";
import { getFollowerCount } from "../services/followService";
import {
  getMyBusinesses,
  getPublicBusinessBySlug,
  getBusinessById,
} from "../services/businessManagementService";
import { Button } from "../components/UI/Button";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { BroadcastModal } from "../components/dashboard/BroadcastModal";

const PAGE_SIZE = 20;

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BroadcastsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { businessSlug: paramBusinessSlug } = useParams<{ businessSlug?: string }>();

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessSlug, setBusinessSlug] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [status, setStatus] = useState<BroadcastStatusDTO | null>(null);

  const [broadcasts, setBroadcasts] = useState<BroadcastDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ── Resolve business ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = paramBusinessSlug
      ? (() => {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramBusinessSlug);
          return isUUID ? getBusinessById(paramBusinessSlug) : getPublicBusinessBySlug(paramBusinessSlug);
        })()
      : getMyBusinesses().then((list) => {
          if (list.length === 0) throw new Error("no-business");
          return list[0];
        });

    load
      .then((biz) => {
        setBusinessId(biz.id);
        setBusinessSlug(biz.slug ?? paramBusinessSlug ?? "");
      })
      .catch(() => setError(t("dashboard.error.noBusinessFound")));
  }, [paramBusinessSlug, t]);

  // ── Load follower count + quota status once businessId is known ───────────
  useEffect(() => {
    if (!businessId) return;
    getFollowerCount(businessId).then(setFollowerCount).catch(() => {});
    getBroadcastStatus(businessId).then(setStatus).catch(() => {});
  }, [businessId]);

  // ── Load first page of broadcasts ─────────────────────────────────────────
  const loadBroadcasts = useCallback(
    async (targetPage: number, append = false) => {
      if (!businessId) return;
      append ? setLoadingMore(true) : setLoading(true);
      try {
        const data = await getBroadcasts(businessId, targetPage, PAGE_SIZE);
        setBroadcasts((prev) => (append ? [...prev, ...data.items] : data.items));
        setTotal(data.total);
        setPage(targetPage);
      } catch {
        setError(t("common.error"));
      } finally {
        append ? setLoadingMore(false) : setLoading(false);
      }
    },
    [businessId, t],
  );

  useEffect(() => {
    loadBroadcasts(1);
  }, [loadBroadcasts]);

  // ── After successful send ─────────────────────────────────────────────────
  function handleSent(count: number) {
    setModalOpen(false);
    setToast(t("broadcast.sendSuccess", { count }));
    setTimeout(() => setToast(null), 4000);
    // Refresh quota and history
    if (businessId) {
      getBroadcastStatus(businessId).then(setStatus).catch(() => {});
    }
    loadBroadcasts(1);
  }

  const hasMore = broadcasts.length < total;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-background-dark p-6">
        <MaterialIcon name="error_outline" className="text-5xl text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          {t("common.back")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
        {/* ── Header ── */}
        <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => navigate(businessSlug ? `/dashboard/${businessSlug}` : "/dashboard")}
                className="shrink-0 p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label={t("common.back")}
              >
                <MaterialIcon name="arrow_back" className="text-xl" />
              </button>
              <div className="min-w-0">
                <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
                  {t("broadcast.pageTitle")}
                </h1>
                <p className="text-xs text-gray-500 truncate">{t("broadcast.pageSubtitle")}</p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setModalOpen(true)}
              disabled={status !== null && status.sentToday >= status.dailyLimit}
            >
              <MaterialIcon name="campaign" className="text-base mr-1.5" />
              {t("broadcast.sendButton")}
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Quota status card */}
          {status && (
            <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 text-sm ${
              status.sentToday >= status.dailyLimit
                ? "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800"
                : "bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800"
            }`}>
              <MaterialIcon
                name={status.sentToday >= status.dailyLimit ? "block" : "campaign"}
                className={`text-xl shrink-0 ${status.sentToday >= status.dailyLimit ? "text-red-400" : "text-rose-400"}`}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {status.sentToday >= status.dailyLimit
                  ? t("broadcast.rateLimitExhausted", {
                      time: status.resetsAt
                        ? new Date(status.resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "",
                    })
                  : t("broadcast.rateLimitBanner", {
                      remaining: status.dailyLimit - status.sentToday,
                      limit: status.dailyLimit,
                    })}
              </span>
            </div>
          )}

          {/* History */}
          <section>
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
              {t("broadcast.historyTitle")}
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 animate-pulse" />
                ))}
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 p-8 text-center">
                <MaterialIcon name="campaign" className="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("broadcast.historyEmpty")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {broadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-[#111418] dark:text-white leading-snug">
                        {b.title}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                        {formatDate(b.sentAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {b.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <MaterialIcon name="group" className="text-sm" />
                      {t("broadcast.sentTo", { count: b.followerCount })}
                    </p>
                  </div>
                ))}

                {hasMore && (
                  <button
                    type="button"
                    onClick={() => loadBroadcasts(page + 1, true)}
                    disabled={loadingMore}
                    className="w-full rounded-xl border border-dashed border-gray-300 dark:border-gray-700 py-3 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition disabled:opacity-50"
                  >
                    {loadingMore ? t("common.loading") : t("broadcast.loadMore")}
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Compose modal */}
      {modalOpen && businessId && (
        <BroadcastModal
          businessId={businessId}
          followerCount={followerCount}
          status={status}
          onClose={() => setModalOpen(false)}
          onSent={handleSent}
        />
      )}

      {/* Success toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <MaterialIcon name="check_circle" className="text-base shrink-0" />
          {toast}
        </div>
      )}
    </>
  );
}
