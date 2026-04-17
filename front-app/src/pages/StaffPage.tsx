import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tutorial, type TutorialStep } from "../components/UI/Tutorial/Tutorial";
import { useTutorial } from "../hooks/useTutorial";
import {
  getStaff,
  getPendingInvitations,
  inviteStaff,
  cancelInvitation,
  removeStaff,
  getInactiveStaff,
  InactiveStaffEntryType,
  type StaffMember,
  type StaffInvitation,
  type InactiveStaffEntry,
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

// ─── Tutorial steps ────────────────────────────────────────────────────────────

const STAFF_MANAGEMENT_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "[data-tutorial='staff-list']",
    titleKey: "tutorials.staff-management.step1.title",
    bodyKey: "tutorials.staff-management.step1.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='staff-invite-btn']",
    titleKey: "tutorials.staff-management.step2.title",
    bodyKey: "tutorials.staff-management.step2.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='staff-pending']",
    titleKey: "tutorials.staff-management.step3.title",
    bodyKey: "tutorials.staff-management.step3.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='staff-list']",
    titleKey: "tutorials.staff-management.step4.title",
    bodyKey: "tutorials.staff-management.step4.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='staff-list']",
    titleKey: "tutorials.staff-management.step5.title",
    bodyKey: "tutorials.staff-management.step5.body",
    placement: "bottom",
  },
];

// ─── StaffPage ────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { businessSlug } = useParams<{ businessSlug: string }>();

  const [bid, setBid] = useState<string>("");
  // owner entry (isOwner === true) is first in the list from the API
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [inactive, setInactive] = useState<InactiveStaffEntry[]>([]);
  const [allServices, setAllServices] = useState<ServiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inactiveExpanded, setInactiveExpanded] = useState(false);

  const { isActive: tutorialActive, markSeen: markTutorialSeen } = useTutorial("staff-management");

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
      getInactiveStaff(bid),
    ])
      .then(([s, inv, svc, inact]) => {
        setStaff(s);
        setInvitations(inv);
        setAllServices(svc);
        setInactive(inact);
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
    const member = staff.find((m) => m.userId === userId);
    if (member?.isOwner) return; // owner cannot be removed
    setRemovingId(userId);
    try {
      await removeStaff(bid, userId);
      setStaff((prev) => prev.filter((m) => m.userId !== userId));
      setSelectedMember(null);
      if (member) {
        setInactive((prev) => [
          {
            entryType: InactiveStaffEntryType.RemovedStaff,
            userId: member.userId,
            name: member.name,
            email: member.email,
            statusChangedAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
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
        <Button variant="outline" onClick={() => navigate(`/dashboard/${businessSlug}`)}>
          {t("buttons.goBack")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {tutorialActive && (
        <Tutorial
          tutorialKey="staff-management"
          steps={STAFF_MANAGEMENT_TUTORIAL_STEPS}
          onComplete={markTutorialSeen}
          onSkip={markTutorialSeen}
        />
      )}
      {/* ── Header ── */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/${businessSlug}`)}
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
                {staff.filter((m) => !m.isOwner).length}{" "}
                {t("nav.staff").toLowerCase()}
              </p>
            </div>
          </div>
          <Button
            data-tutorial="staff-invite-btn"
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

        {/* ── Owner section (US-02-G-02) ── */}
        {staff.filter((m) => m.isOwner).map((owner) => (
          <section key={owner.userId}>
            <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
              {t("staff.ownerSection")}
            </h2>
            <button
              type="button"
              onClick={() => setSelectedMember(owner)}
              className="w-full text-left"
            >
              <Card className="p-4 flex items-center gap-4 hover:shadow-md transition cursor-pointer border-primary/20">
                <div className="h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">
                    {getInitials(owner.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                      {owner.name}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide shrink-0">
                      {t("staff.ownerBadge")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{owner.email}</p>
                  <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <MaterialIcon name="design_services" className="text-xs" />
                    {owner.assignedServicesCount} {t("business.myServices").toLowerCase()}
                  </span>
                </div>
                <MaterialIcon name="chevron_right" className="text-gray-400 shrink-0" />
              </Card>
            </button>
          </section>
        ))}

        {/* ── Active Staff (US-02-E-01) ── */}
        <section data-tutorial="staff-list">
          <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
            {t("staff.teamMembers")}
          </h2>

          {staff.filter((m) => !m.isOwner).length === 0 ? (
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
              {staff.filter((m) => !m.isOwner).map((member) => (
                <button
                  key={member.userId}
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  disabled={removingId === member.userId}
                  className="w-full text-left"
                >
                  <Card className="p-4 flex items-center gap-4 hover:shadow-md transition cursor-pointer">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">
                        {getInitials(member.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#111418] dark:text-white text-sm truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MaterialIcon name="calendar_today" className="text-xs" />
                          {t("staff.joined", { date: formatDate(member.joinedAt) })}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MaterialIcon name="design_services" className="text-xs" />
                          {member.assignedServicesCount} {t("business.myServices").toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <MaterialIcon name="chevron_right" className="text-gray-400 shrink-0" />
                  </Card>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Pending Invitations (US-02-E-02) ── */}
        {invitations.length > 0 && (
          <section data-tutorial="staff-pending">
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

        {/* ── Inactive / Past Members ── */}
        {inactive.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setInactiveExpanded((v) => !v)}
              className="flex w-full items-center justify-between mb-4 group"
            >
              <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                {t("staff.inactiveSection")}
                <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-gray-200 dark:bg-gray-700 text-[11px] font-bold text-gray-600 dark:text-gray-300 px-1.5">
                  {inactive.length}
                </span>
              </h2>
              <MaterialIcon
                name={inactiveExpanded ? "expand_less" : "expand_more"}
                className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors"
              />
            </button>

            {inactiveExpanded && (
              <div className="space-y-3">
                {inactive.map((entry, idx) => {
                  const isRemoved = entry.entryType === InactiveStaffEntryType.RemovedStaff;
                  const isDeclined = entry.entryType === InactiveStaffEntryType.DeclinedInvitation;

                  const iconName = isRemoved ? "person_remove" : isDeclined ? "cancel" : "schedule";
                  const iconBg = isRemoved
                    ? "bg-red-100 dark:bg-red-900/20"
                    : isDeclined
                    ? "bg-amber-100 dark:bg-amber-900/20"
                    : "bg-gray-100 dark:bg-gray-800";
                  const iconColor = isRemoved
                    ? "text-red-500"
                    : isDeclined
                    ? "text-amber-500"
                    : "text-gray-400";
                  const statusLabel = isRemoved
                    ? t("staff.inactive.removed")
                    : isDeclined
                    ? t("staff.inactive.declined")
                    : t("staff.inactive.expired");

                  return (
                    <Card key={`${entry.entryType}-${entry.email}-${idx}`} className="p-4 opacity-80">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                          <MaterialIcon name={iconName} className={`text-base ${iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          {entry.name && (
                            <p className="text-sm font-semibold text-[#111418] dark:text-white truncate">
                              {entry.name}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 truncate">{entry.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {statusLabel} · {formatDate(entry.statusChangedAt)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
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
