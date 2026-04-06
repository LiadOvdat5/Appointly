import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import {
  getAdminUsers,
  suspendUser,
  reactivateUser,
  type AdminUser,
} from "../services/adminService";

const ROLE_OPTIONS = ["", "client", "owner", "partner", "admin"];

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  client:  { label: "Customer", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  owner:   { label: "Owner",    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  partner: { label: "Staff",    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  admin:   { label: "Admin",    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_BADGE[role.toLowerCase()] ?? { label: role, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Suspend modal ─────────────────────────────────────────────────────────────

function SuspendModal({
  user,
  onConfirm,
  onCancel,
  loading,
}: {
  user: AdminUser;
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
            <MaterialIcon name="block" className="text-xl text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-bold text-sm text-[#111418] dark:text-white">Suspend Account</p>
            <p className="text-xs text-gray-500 truncate">{user.name} — {user.email}</p>
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

export default function AdminUsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action state
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  // Debounce search input
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
      const data = await getAdminUsers({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        page,
        pageSize: 20,
      });
      setUsers(data.users);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, page]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleSuspend(reason: string) {
    if (!suspendTarget) return;
    setActingId(suspendTarget.id);
    try {
      await suspendUser(suspendTarget.id, reason || undefined);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === suspendTarget.id
            ? { ...u, isSuspended: true, suspendedReason: reason || null }
            : u,
        ),
      );
    } catch {
      setError("Failed to suspend user.");
    } finally {
      setActingId(null);
      setSuspendTarget(null);
    }
  }

  async function handleReactivate(userId: string) {
    setActingId(userId);
    try {
      await reactivateUser(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isSuspended: false, suspendedReason: null } : u,
        ),
      );
    } catch {
      setError("Failed to reactivate user.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <>
      {suspendTarget && (
        <SuspendModal
          user={suspendTarget}
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
              Users
            </h1>
            <p className="text-xs text-gray-500">
              {loading ? "Loading…" : `${totalCount.toLocaleString()} registered`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="user-search"
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-xl border border-[#e7edf3] dark:border-gray-700 bg-white dark:bg-surface-dark text-sm px-3 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r === "" ? "All roles" : ROLE_BADGE[r]?.label ?? r}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && users.length === 0 && !error && (
          <Card className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MaterialIcon name="person_search" className="text-3xl text-gray-400" />
            </div>
            <p className="font-semibold text-sm text-[#111418] dark:text-white">No users found</p>
            <p className="text-xs text-gray-400">Try adjusting your search or filter.</p>
          </Card>
        )}

        {/* User list */}
        {!loading && users.length > 0 && (
          <div className="space-y-2">
            {users.map((user) => {
              const isActing = actingId === user.id;
              return (
                <Card
                  key={user.id}
                  className={[
                    "px-4 py-3 flex items-center gap-3",
                    user.isSuspended
                      ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                      : "",
                  ].join(" ")}
                >
                  {/* Avatar initial */}
                  <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 text-sm font-bold text-gray-600 dark:text-gray-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111418] dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <RoleBadge role={user.role} />
                      {user.isSuspended && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          <MaterialIcon name="block" className="text-xs leading-none" />
                          Suspended
                        </span>
                      )}
                    </div>
                    {user.isSuspended && user.suspendedReason && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 truncate">
                        Reason: {user.suspendedReason}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Joined {formatDate(user.createdAt)}</p>
                  </div>

                  {/* Action */}
                  {user.role.toLowerCase() !== "admin" && (
                    user.isSuspended ? (
                      <button
                        type="button"
                        onClick={() => handleReactivate(user.id)}
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
                        onClick={() => setSuspendTarget(user)}
                        disabled={isActing}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <MaterialIcon name="block" className="text-base leading-none" />
                        Suspend
                      </button>
                    )
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
