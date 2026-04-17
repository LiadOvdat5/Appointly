import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getMyInvitations,
  respondToInvitation,
  InvitationStatus,
  type MyInvitation,
} from "../services/invitationService";
import { me } from "../api/auth";
import { useAppDispatch } from "../redux/hooks";
import { setSession } from "../redux/authSlice";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Role } from "../constants/roles";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── InvitationCard ───────────────────────────────────────────────────────────

function InvitationCard({
  invitation,
  onRespond,
}: {
  invitation: MyInvitation;
  onRespond: (id: string, accept: boolean) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const isPending = invitation.status === InvitationStatus.Pending;
  const days = daysUntil(invitation.expirationDate);

  async function handle(accept: boolean) {
    setLoading(accept ? "accept" : "decline");
    try {
      await onRespond(invitation.id, accept);
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="p-5 space-y-4">
      {/* Business info */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
          <MaterialIcon name="storefront" className="text-xl text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#111418] dark:text-white text-sm truncate">
            {invitation.businessName}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("invitations.invitedAt", { date: formatDate(invitation.invitedAt) })}
          </p>

          {isPending && (
            <p
              className={[
                "text-xs font-semibold mt-1 flex items-center gap-1",
                days <= 1
                  ? "text-red-500"
                  : days <= 3
                    ? "text-orange-500"
                    : "text-gray-400",
              ].join(" ")}
            >
              <MaterialIcon name="timer" className="text-xs leading-none" />
              {days === 0
                ? t("invitations.expiresToday")
                : t("invitations.expiresIn_other", { count: days })}
            </p>
          )}
        </div>

        {/* Status badge for non-pending */}
        {!isPending && (
          <span
            className={[
              "shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full",
              invitation.status === InvitationStatus.Accepted
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : invitation.status === InvitationStatus.Declined
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
            ].join(" ")}
          >
            {invitation.status === InvitationStatus.Accepted
              ? t("invitations.status.accepted")
              : invitation.status === InvitationStatus.Declined
                ? t("invitations.status.declined")
                : t("invitations.status.expired")}
          </span>
        )}
      </div>

      {/* Optional message */}
      {invitation.message && (
        <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 italic">
          "{invitation.message}"
        </p>
      )}

      {/* Actions — only for pending */}
      {isPending && (
        <div className="flex gap-3 pt-1">
          <Button
            variant="primary"
            size="sm"
            isLoading={loading === "accept"}
            disabled={loading !== null}
            onClick={() => handle(true)}
          >
            {t("invitations.actions.accept")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            isLoading={loading === "decline"}
            disabled={loading !== null}
            onClick={() => handle(false)}
          >
            {t("invitations.actions.decline")}
          </Button>
        </div>
      )}
    </Card>
  );
}

// ─── InvitationsPage ──────────────────────────────────────────────────────────

export default function InvitationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [invitations, setInvitations] = useState<MyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getMyInvitations()
      .then(setInvitations)
      .catch(() => setError(t("invitations.error.loadFailed")))
      .finally(() => setLoading(false));
  }, [t]);

  async function handleRespond(invitationId: string, accept: boolean) {
    const updated = await respondToInvitation(invitationId, accept);

    // Update local invitation state
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === invitationId ? { ...inv, status: updated.status } : inv)),
    );

    // If accepted: refresh the session so the new role + businessId are reflected,
    // then redirect to the staff dashboard
    if (accept) {
      try {
        const session = await me();
        dispatch(
          setSession({
            user: session.user,
            expiresAt: new Date(session.expiresAt).getTime(),
          }),
        );
        if (session.user.role === Role.Partner && session.user.businessId) {
          navigate(`/staff-dashboard/${session.user.businessId}`);
        }
      } catch {
        // session refresh failed — user will see updated status but stays on the page
      }
    }
  }

  const pending = invitations.filter((i) => i.status === InvitationStatus.Pending);
  const past = invitations.filter((i) => i.status !== InvitationStatus.Pending);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* ── Header ── */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={t("common.back")}
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <div>
            <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
              {t("invitations.title")}
            </h1>
            {pending.length > 0 && (
              <p className="text-xs text-indigo-500 font-semibold mt-0.5">
                {t("invitations.pendingCount_other", { count: pending.length })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* ── Pending ── */}
        {pending.length > 0 && (
          <section>
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
              {t("invitations.sections.pending")}
            </h2>
            <div className="space-y-4">
              {pending.map((inv) => (
                <InvitationCard
                  key={inv.id}
                  invitation={inv}
                  onRespond={handleRespond}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {pending.length === 0 && past.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MaterialIcon name="mail_outline" className="text-3xl text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-[#111418] dark:text-white text-sm">
                {t("invitations.empty.title")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t("invitations.empty.text")}
              </p>
            </div>
          </div>
        )}

        {/* ── Past ── */}
        {past.length > 0 && (
          <section>
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
              {t("invitations.sections.past")}
            </h2>
            <div className="space-y-4">
              {past.map((inv) => (
                <InvitationCard
                  key={inv.id}
                  invitation={inv}
                  onRespond={handleRespond}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
