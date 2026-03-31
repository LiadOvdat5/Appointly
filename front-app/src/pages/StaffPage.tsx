import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getStaff,
  getPendingInvitations,
  inviteStaff,
  cancelInvitation,
  removeStaff,
  getStaffServices,
  updateStaffServices,
  getStaffReport,
  type StaffMember,
  type StaffInvitation,
  type StaffReport,
} from "../services/staffService";
import {
  getServicesForBusiness,
  getBusinessById,
  getPublicBusinessBySlug,
} from "../services/businessManagementService";
import type { ServiceProfile } from "../types/business";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { ConfirmDialog } from "../components/UI/ConfirmDialog";
import { StatCard } from "../components/UI/StatCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── InviteModal ──────────────────────────────────────────────────────────────

function InviteModal({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (email: string, message: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onInvite(email.trim(), message.trim());
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data
              ?.error ?? t("staff.error.inviteFailed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#111418] dark:text-white text-base">
            {t("staff.inviteModal.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MaterialIcon name="close" className="text-xl text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label={t("staff.inviteModal.emailLabel")}
            type="email"
            value={email}
            onValueChange={setEmail}
            placeholder={t("staff.inviteModal.emailPlaceholder")}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
              {t("staff.inviteModal.messageLabel")}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("staff.inviteModal.messagePlaceholder")}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-[#111418] dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <Button type="submit" variant="primary" isLoading={loading}>
            {t("staff.inviteModal.submitButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── StaffDetailModal ─────────────────────────────────────────────────────────

function StaffDetailModal({
  member,
  businessId,
  allServices,
  onClose,
  onRemove,
}: {
  member: StaffMember;
  businessId: string;
  allServices: ServiceProfile[];
  onClose: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [assignedIds, setAssignedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [report, setReport] = useState<StaffReport | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setServicesLoading(true);
    getStaffServices(businessId, member.userId)
      .then(setAssignedIds)
      .finally(() => setServicesLoading(false));

    setReportLoading(true);
    getStaffReport(businessId, member.userId)
      .then(setReport)
      .finally(() => setReportLoading(false));
  }, [businessId, member.userId]);

  function toggleService(id: string) {
    setAssignedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSaveServices() {
    setSaving(true);
    setSaveError(null);
    try {
      await updateStaffServices(businessId, member.userId, assignedIds);
    } catch {
      setSaveError(t("staff.error.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-surface-dark shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">
                {getInitials(member.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#111418] dark:text-white text-sm truncate">
                {member.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{member.email}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
            >
              <MaterialIcon name="close" className="text-xl text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* ── Analytics (US-02-E-05) ── */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {t("staff.detail.performance")}
              </h3>
              {reportLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : report ? (
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label={t("staff.detail.appointments")}
                    value={String(report.totalAppointments)}
                    description={t("staff.detail.thisPeriod")}
                    iconBgColor="bg-green-100 dark:bg-green-900/30"
                    icon={
                      <MaterialIcon
                        name="event_available"
                        className="text-xl text-green-600"
                      />
                    }
                  />
                  <StatCard
                    label={t("staff.detail.revenue")}
                    value={`$${report.revenue.toFixed(2)}`}
                    description={t("staff.detail.fromCompleted")}
                    iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                    icon={
                      <MaterialIcon
                        name="payments"
                        className="text-xl text-blue-600"
                      />
                    }
                  />
                  <StatCard
                    label={t("staff.detail.completion")}
                    value={`${report.completionRate}%`}
                    description={t("staff.detail.completionRate")}
                    iconBgColor="bg-purple-100 dark:bg-purple-900/30"
                    icon={
                      <MaterialIcon
                        name="done_all"
                        className="text-xl text-purple-600"
                      />
                    }
                  />
                  <StatCard
                    label={t("staff.detail.avgRating")}
                    value="—"
                    description={t("staff.detail.comingSoon")}
                    iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
                    icon={
                      <MaterialIcon
                        name="star"
                        className="text-xl text-yellow-500"
                      />
                    }
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t("staff.detail.noData")}</p>
              )}
            </section>

            {/* ── Service Assignments (US-02-E-04) ── */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {t("staff.detail.serviceAssignments")}
              </h3>
              {servicesLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : allServices.length === 0 ? (
                <p className="text-sm text-gray-400">
                  {t("staff.detail.noServices")}
                </p>
              ) : (
                <div className="space-y-2">
                  {allServices.map((svc) => {
                    const checked = assignedIds.includes(svc.id);
                    return (
                      <label
                        key={svc.id}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(svc.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111418] dark:text-white truncate">
                            {svc.name}
                          </p>
                          {svc.price != null && (
                            <p className="text-xs text-gray-500">
                              ${svc.price.toFixed(2)} · {svc.duration} min
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {saveError && (
                <p className="text-xs text-red-500 mt-2">{saveError}</p>
              )}

              <div className="mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                  onClick={handleSaveServices}
                  disabled={servicesLoading}
                >
                  {t("staff.detail.saveAssignments")}
                </Button>
              </div>
            </section>

            {/* ── Remove Staff (US-02-E-03) ── */}
            <section className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition"
              >
                <MaterialIcon name="person_remove" className="text-base" />
                {t("staff.detail.removeFromBusiness")}
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* Confirm remove dialog */}
      <ConfirmDialog
        open={confirmRemove}
        title={t("staff.remove.title")}
        message={t("staff.remove.message", { name: member.name })}
        confirmLabel={t("staff.remove.confirmLabel")}
        destructive
        onConfirm={() => {
          setConfirmRemove(false);
          onRemove();
        }}
        onCancel={() => setConfirmRemove(false)}
      />
    </>
  );
}

// ─── StaffPage ────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { businessSlug } = useParams<{ businessSlug: string }>();

  const [bid, setBid] = useState<string>("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [allServices, setAllServices] = useState<ServiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(
    null,
  );
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Resolve slug → UUID
  useEffect(() => {
    if (!businessSlug) return;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessSlug);
    const load = isUUID ? getBusinessById(businessSlug) : getPublicBusinessBySlug(businessSlug);
    load.then((biz) => setBid(biz.id)).catch(() => setError(t("staff.error.loadFailed")));
  }, [businessSlug, t]);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!bid) return;
    setLoading(true);
    Promise.all([
      getStaff(bid),
      getPendingInvitations(bid),
      getServicesForBusiness(bid),
    ])
      .then(([s, inv, svc]) => {
        setStaff(s);
        setInvitations(inv);
        setAllServices(svc);
      })
      .catch(() => setError(t("staff.error.loadFailed")))
      .finally(() => setLoading(false));
  }, [bid, t]);

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleInvite(email: string, message: string) {
    const newInvite = await inviteStaff(bid, email, message);
    setInvitations((prev) => [newInvite, ...prev]);
  }

  async function handleCancelInvitation(invitationId: string) {
    setCancellingId(invitationId);
    try {
      await cancelInvitation(bid, invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } finally {
      setCancellingId(null);
    }
  }

  async function handleRemoveMember(userId: string) {
    setRemovingId(userId);
    try {
      await removeStaff(bid, userId);
      setStaff((prev) => prev.filter((m) => m.userId !== userId));
      setSelectedMember(null);
    } finally {
      setRemovingId(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-background-dark p-6">
        <MaterialIcon name="error_outline" className="text-5xl text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          {t("buttons.goBack")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* ── Header ── */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label={t("common.back")}
            >
              <MaterialIcon name="arrow_back" className="text-xl" />
            </button>
            <div>
              <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
                {t("staff.title")}
              </h1>
              <p className="text-xs text-gray-500">
                {staff.length} {staff.length !== 1 ? t("nav.staff").toLowerCase() : t("nav.staff").toLowerCase()}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-auto! px-4"
            onClick={() => setShowInviteModal(true)}
          >
            <MaterialIcon name="person_add" className="text-base" />
            {t("staff.inviteButton")}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* ── Active Staff (US-02-E-01) ── */}
        <section>
          <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
            {t("staff.teamMembers")}
          </h2>

          {staff.length === 0 ? (
            <Card className="p-8 flex flex-col items-center gap-3 text-center">
              <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <MaterialIcon
                  name="group"
                  className="text-3xl text-gray-400"
                />
              </div>
              <div>
                <p className="font-semibold text-[#111418] dark:text-white text-sm">
                  {t("staff.empty.title")}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("staff.empty.text")}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-auto! px-5 mt-1"
                onClick={() => setShowInviteModal(true)}
              >
                {t("staff.inviteButton")}
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {staff.map((member) => (
                <button
                  key={member.userId}
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  disabled={removingId === member.userId}
                  className="w-full text-left"
                >
                  <Card className="p-4 flex items-center gap-4 hover:shadow-md transition cursor-pointer">
                    {/* Avatar */}
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">
                        {getInitials(member.name)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MaterialIcon
                            name="calendar_today"
                            className="text-xs"
                          />
                          {t("staff.joined", { date: formatDate(member.joinedAt) })}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MaterialIcon name="design_services" className="text-xs" />
                          {member.assignedServicesCount} {member.assignedServicesCount !== 1 ? t("business.myServices").toLowerCase() : t("business.myServices").toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <MaterialIcon
                      name="chevron_right"
                      className="text-gray-400 shrink-0"
                    />
                  </Card>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Pending Invitations (US-02-E-02) ── */}
        {invitations.length > 0 && (
          <section>
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
              {t("staff.pendingInvitations")}
            </h2>
            <div className="space-y-3">
              {invitations.map((inv) => (
                <Card key={inv.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                      <MaterialIcon
                        name="mail"
                        className="text-base text-orange-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111418] dark:text-white truncate">
                        {inv.workerEmail}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("staff.expires", { date: formatDate(inv.expirationDate) })}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={cancellingId === inv.id}
                      onClick={() => handleCancelInvitation(inv.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 shrink-0"
                    >
                      {cancellingId === inv.id ? t("staff.cancelling") : t("staff.cancel")}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Modals ── */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
        />
      )}

      {selectedMember && (
        <StaffDetailModal
          member={selectedMember}
          businessId={bid}
          allServices={allServices}
          onClose={() => setSelectedMember(null)}
          onRemove={() => handleRemoveMember(selectedMember.userId)}
        />
      )}
    </div>
  );
}
