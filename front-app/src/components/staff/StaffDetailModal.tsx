import { useEffect, useState } from "react";
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

            {/* Remove Staff */}
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
