import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getStaffServices,
  updateStaffServices,
  getStaffReport,
  type StaffMember,
  type StaffReport,
} from "../../services/staffService";
import type { ServiceProfile } from "../../types/business";
import { Button } from "../UI/Button";
import { Alert } from "../UI/Alert";
import { MaterialIcon } from "../UI/MaterialIcon";
import { ConfirmDialog } from "../UI/ConfirmDialog";
import { StatCard } from "../UI/StatCard";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── BlockOnBooking dialog (US-02-G-03) ────────────────────────────────────────

interface BlockingDialogProps {
  staffName: string;
  serviceName: string;
  onConfirm: (blockOnBooking: boolean) => void;
  onCancel: () => void;
}

function BlockingDialog({ staffName, serviceName, onConfirm, onCancel }: BlockingDialogProps) {
  const { t } = useTranslation();
  const [block, setBlock] = useState(true);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl p-6 space-y-4">
        <h3 className="font-bold text-[#111418] dark:text-white text-base">
          {t("staff.blockingDialog.title")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("staff.blockingDialog.description", { staffName, serviceName })}
        </p>

        <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <div
            role="switch"
            aria-checked={block}
            tabIndex={0}
            onClick={() => setBlock((v) => !v)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setBlock((v) => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              block ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                block ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-sm font-medium text-[#111418] dark:text-white">
            {t("staff.blockingDialog.toggleLabel")}
          </span>
        </label>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {t("buttons.cancel")}
          </Button>
          <Button variant="primary" size="sm" onClick={() => onConfirm(block)}>
            {t("buttons.confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── StaffDetailModal ──────────────────────────────────────────────────────────

interface StaffDetailModalProps {
  member: StaffMember;
  businessId: string;
  allServices: ServiceProfile[];
  onClose: () => void;
  onRemove: () => void;
}

export function StaffDetailModal({
  member,
  businessId,
  allServices,
  onClose,
  onRemove,
}: StaffDetailModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Service IDs currently assigned to this person
  const [assignedIds, setAssignedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [report, setReport] = useState<StaffReport | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Pending toggle: when assigning a 2nd+ service we show the BlockOnBooking dialog
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);
  const [pendingAssign, setPendingAssign] = useState(false); // true = turning on

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

  function handleToggle(serviceId: string) {
    const isCurrentlyAssigned = assignedIds.includes(serviceId);

    if (!isCurrentlyAssigned) {
      // Assigning: if this would be the 2nd+ service, show BlockOnBooking dialog
      if (assignedIds.length >= 1) {
        setPendingToggleId(serviceId);
        setPendingAssign(true);
        return;
      }
      setAssignedIds((prev) => [...prev, serviceId]);
    } else {
      setAssignedIds((prev) => prev.filter((x) => x !== serviceId));
    }
  }

  function handleBlockingDialogConfirm(_blockOnBooking: boolean) {
    // blockOnBooking preference is saved per-service via PATCH after Save
    if (pendingToggleId) {
      setAssignedIds((prev) => [...prev, pendingToggleId]);
    }
    setPendingToggleId(null);
  }

  function handleBlockingDialogCancel() {
    setPendingToggleId(null);
  }

  async function handleSaveServices() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateStaffServices(businessId, member.userId, assignedIds);
      setSaveSuccess(true);
    } catch {
      setSaveError(t("staff.error.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  // US-02-G-05: banner logic
  const assignedServices = allServices.filter((s) => assignedIds.includes(s.id));
  const showConflictBanner = assignedServices.length >= 2;
  const someBlockOff = assignedServices.some((s) => s.blockOnBooking === false);

  const pendingService = pendingToggleId
    ? allServices.find((s) => s.id === pendingToggleId)
    : null;
  // Find the first already-assigned service to name in the dialog
  const firstAssignedService = assignedIds.length > 0
    ? allServices.find((s) => s.id === assignedIds[0])
    : null;

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
              <div className="flex items-center gap-2">
                <p className="font-bold text-[#111418] dark:text-white text-sm truncate">
                  {member.name}
                </p>
                {member.isOwner && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide shrink-0">
                    {t("staff.ownerBadge")}
                  </span>
                )}
              </div>
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
            {/* Analytics */}
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

            {/* Service Assignments */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {t("staff.detail.serviceAssignments")}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {t("staff.detail.assignmentNote")}
              </p>
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
                <p className="text-sm text-gray-400">{t("staff.detail.noServices")}</p>
              ) : (
                <div className="space-y-2">
                  {allServices.map((svc) => {
                    const checked = assignedIds.includes(svc.id);
                    // Warn if this service is already assigned to someone else
                    const assignedToOther =
                      !checked &&
                      svc.assignedStaff != null &&
                      svc.assignedStaff.id !== member.userId;

                    return (
                      <label
                        key={svc.id}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggle(svc.id)}
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
                          {assignedToOther && (
                            <p className="text-xs text-amber-500 flex items-center gap-1 mt-0.5">
                              <MaterialIcon name="swap_horiz" className="text-xs" />
                              {t("staff.detail.replacesAssignee", {
                                name: svc.assignedStaff!.name,
                              })}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {saveSuccess && (
                <div className="mt-2">
                  <Alert variant="success">{t("staff.detail.saveSuccess")}</Alert>
                </div>
              )}
              {saveError && (
                <div className="mt-2">
                  <Alert variant="error">{saveError}</Alert>
                </div>
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

            {/* US-02-G-05: Parallel booking conflict banner */}
            {showConflictBanner && (
              <section className="rounded-xl border px-4 py-3 space-y-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-start gap-2">
                  <MaterialIcon
                    name={someBlockOff ? "warning" : "shield"}
                    className={`text-base mt-0.5 shrink-0 ${someBlockOff ? "text-amber-500" : "text-blue-500"}`}
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111418] dark:text-white">
                      {someBlockOff
                        ? t("staff.conflictBanner.partiallyOff")
                        : t("staff.conflictBanner.active")}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {someBlockOff
                        ? t("staff.conflictBanner.partiallyOffBody", { name: member.name })
                        : t("staff.conflictBanner.activeBody", { name: member.name })}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate("../services");
                      }}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {t("staff.conflictBanner.goToServices")}
                      <MaterialIcon name="arrow_forward" className="text-xs" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Remove Staff — hidden for owner (US-02-G-02) */}
            {!member.isOwner && (
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
            )}
          </div>
        </div>
      </div>

      {/* Block-on-booking dialog (US-02-G-03) */}
      {pendingToggleId && pendingAssign && pendingService && (
        <BlockingDialog
          staffName={member.name}
          serviceName={firstAssignedService?.name ?? ""}
          onConfirm={handleBlockingDialogConfirm}
          onCancel={handleBlockingDialogCancel}
        />
      )}

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
