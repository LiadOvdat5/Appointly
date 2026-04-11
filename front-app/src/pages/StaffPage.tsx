import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getStaff,
  getPendingInvitations,
  inviteStaff,
  cancelInvitation,
  removeStaff,
  type StaffMember,
  type StaffInvitation,
} from "../services/staffService";
import {
  getServicesForBusiness,
  getBusinessById,
  getPublicBusinessBySlug,
} from "../services/businessManagementService";
import type { ServiceProfile } from "../types/business";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { StaffInviteModal } from "../components/staff/StaffInviteModal";
import { StaffDetailModal } from "../components/staff/StaffDetailModal";

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
        <StaffInviteModal
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
