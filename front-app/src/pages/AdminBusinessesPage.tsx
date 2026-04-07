import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import {
  getAdminBusinesses,
  suspendBusiness,
  reactivateBusiness,
  type AdminBusiness,
} from "../services/adminService";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <MaterialIcon name="star" className="text-yellow-400 text-sm leading-none" />
      {count > 0 ? rating.toFixed(1) : "—"}
      {count > 0 && <span className="text-gray-400">({count})</span>}
    </span>
  );
}

// ── Suspend modal ─────────────────────────────────────────────────────────────

function SuspendModal({
  business,
  onConfirm,
  onCancel,
  loading,
}: {
  business: AdminBusiness;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <MaterialIcon name="storefront" className="text-xl text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-bold text-sm text-[#111418] dark:text-white">Suspend Business</p>
            <p className="text-xs text-gray-500 truncate">{business.name}</p>
          </div>
        </div>

        <Input
          label="Reason (optional)"
          id="suspend-reason"
          type="text"
          placeholder="e.g. Violated terms of service"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
            onClick={() => onConfirm(reason.trim())}
            isLoading={loading}
          >
            Suspend
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminBusinessesPage() {
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [suspendTarget, setSuspendTarget] = useState<AdminBusiness | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminBusinesses({
        search: debouncedSearch || undefined,
        page,
        pageSize: 20,
      });
      setBusinesses(data.businesses);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch {
      setError("Failed to load businesses.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);
  useEffect(() => { load(); }, [load]);

  async function handleSuspend(reason: string) {
    if (!suspendTarget) return;
    const target = suspendTarget;
    setActingId(target.id);
    setError(null);
    setSuspendTarget(null);
    try {
      await suspendBusiness(target.id, reason || undefined);
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === target.id
            ? { ...b, isSuspended: true, suspendedReason: reason || null }
            : b,
        ),
      );
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Failed to suspend business.");
      // Reload to ensure state matches server
      load();
    } finally {
      setActingId(null);
    }
  }

  async function handleReactivate(businessId: string) {
    setActingId(businessId);
    setError(null);
    try {
      await reactivateBusiness(businessId);
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === businessId ? { ...b, isSuspended: false, suspendedReason: null } : b,
        ),
      );
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Failed to reactivate business.");
      // Reload to ensure state matches server
      load();
    } finally {
      setActingId(null);
    }
  }

  return (
    <>
      {suspendTarget && (
        <SuspendModal
          business={suspendTarget}
          onConfirm={handleSuspend}
          onCancel={() => setSuspendTarget(null)}
          loading={actingId === suspendTarget.id}
        />
      )}

      <div className="px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
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
              Businesses
            </h1>
            <p className="text-xs text-gray-500">
              {loading ? "Loading…" : `${totalCount.toLocaleString()} registered`}
            </p>
          </div>
        </div>

        {/* Search */}
        <Input
          id="biz-search"
          type="search"
          placeholder="Search by business name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && businesses.length === 0 && !error && (
          <Card className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MaterialIcon name="store_search" className="text-3xl text-gray-400" />
            </div>
            <p className="font-semibold text-sm text-[#111418] dark:text-white">No businesses found</p>
            <p className="text-xs text-gray-400">Try adjusting your search.</p>
          </Card>
        )}

        {/* Business list */}
        {!loading && businesses.length > 0 && (
          <div className="space-y-2">
            {businesses.map((biz) => {
              const isActing = actingId === biz.id;
              return (
                <Card
                  key={biz.id}
                  className={[
                    "px-4 py-3 flex items-center gap-3",
                    biz.isSuspended
                      ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                      : "",
                  ].join(" ")}
                >
                  {/* Icon */}
                  <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <MaterialIcon name="storefront" className="text-lg text-gray-600 dark:text-gray-300" />
                  </div>

                  {/* Info — clicking opens public page */}
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left"
                    onClick={() => window.open(`/business/${biz.slug}`, "_blank")}
                  >
                    <p className="text-sm font-semibold text-[#111418] dark:text-white truncate hover:underline">
                      {biz.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {biz.ownerName} · {biz.ownerEmail}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {biz.categories.length > 0 && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          {biz.categories.join(", ")}
                        </span>
                      )}
                      <StarRating rating={biz.averageRating} count={biz.reviewCount} />
                      {biz.isSuspended && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          <MaterialIcon name="block" className="text-xs leading-none" />
                          Suspended
                        </span>
                      )}
                    </div>
                    {biz.isSuspended && biz.suspendedReason && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 truncate">
                        Reason: {biz.suspendedReason}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Created {formatDate(biz.createdAt)}</p>
                  </button>

                  {/* Action */}
                  {biz.isSuspended ? (
                    <button
                      type="button"
                      onClick={() => handleReactivate(biz.id)}
                      disabled={isActing}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-green-300 bg-white px-3 py-2 text-sm font-bold text-green-700 hover:bg-green-50 active:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-green-700 dark:bg-transparent dark:text-green-400 dark:hover:bg-green-950/30"
                    >
                      {isActing
                        ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-300 border-t-green-700" />
                        : <MaterialIcon name="check_circle" className="text-base leading-none" />
                      }
                      Reactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSuspendTarget(biz)}
                      disabled={isActing}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <MaterialIcon name="block" className="text-base leading-none" />
                      Suspend
                    </button>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-auto"
            >
              <MaterialIcon name="chevron_left" className="text-base" />
              Prev
            </Button>
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-auto"
            >
              Next
              <MaterialIcon name="chevron_right" className="text-base" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
