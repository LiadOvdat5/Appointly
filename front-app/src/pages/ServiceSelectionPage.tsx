import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {
  getServicesForBusiness,
  getBusinessById,
  getPublicBusinessBySlug,
  createService,
} from "../services/businessManagementService";
import { fetchCategories } from "../services/categoryService";
import { getBusinessAppointments, AppointmentStatus, type AppointmentDTO } from "../services/appointmentService";
import { getStaff, setServiceAssignment, type StaffMember } from "../services/staffService";
import type { ServiceProfile } from "../types/business";
import type { Category } from "../types/search";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Alert } from "../components/UI/Alert";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { CategorySearchSelect } from "../components/UI/CategorySearchSelect";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceSelectionPage() {
  const { t } = useTranslation();
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const authUser = useSelector((s: RootState) => s.auth.user);

  const [businessId, setBusinessId] = useState<string>("");
  const [services, setServices] = useState<ServiceProfile[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add service modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addDuration, setAddDuration] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addCategoryId, setAddCategoryId] = useState("");
  const [addAssignedStaffId, setAddAssignedStaffId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Resolve slug → UUID
  useEffect(() => {
    if (!businessSlug) return;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessSlug);
    const load = isUUID ? getBusinessById(businessSlug) : getPublicBusinessBySlug(businessSlug);
    load.then((biz) => setBusinessId(biz.id)).catch(() => setError(t("serviceSelection.error.loadFailed")));
  }, [businessSlug, t]);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);

    Promise.all([
      getServicesForBusiness(businessId),
      getBusinessAppointments(businessId, 1, 200),
    ])
      .then(([svcs, appts]) => {
        setServices(svcs);
        // Only keep future, non-canceled appointments for the upcoming count
        const now = new Date();
        setAppointments(
          appts.filter(
            (a) =>
              a.status !== AppointmentStatus.Canceled &&
              new Date(a.startDateTime) >= now,
          ),
        );
      })
      .catch(() => setError(t("serviceSelection.error.loadFailed")))
      .finally(() => setLoading(false));
  }, [businessId]);

  // Fetch categories + staff once when modal opens
  useEffect(() => {
    if (!addOpen) return;
    if (categories.length === 0) fetchCategories().then(setCategories).catch(() => {});
    if (staffList.length === 0 && businessId)
      getStaff(businessId).then((s) => setStaffList(s as StaffMember[])).catch(() => {});
  }, [addOpen, businessId, categories.length, staffList.length]);

  function openAddModal() {
    setAddName("");
    setAddDescription("");
    setAddDuration("");
    setAddPrice("");
    setAddCategoryId("");
    setAddAssignedStaffId("");
    setAddError(null);
    setAddOpen(true);
  }

  const addDurationNum = Number(addDuration);
  const addPriceNum = Number(addPrice);
  const addDurationError =
    addDuration !== "" && (isNaN(addDurationNum) || addDurationNum <= 0)
      ? t("publicBusiness.durationPositive")
      : undefined;
  const addPriceError =
    addPrice !== "" && (isNaN(addPriceNum) || addPriceNum < 0)
      ? t("publicBusiness.priceNotNegative")
      : undefined;
  const canAddService =
    addName.trim().length > 0 &&
    addDuration !== "" &&
    !addDurationError &&
    !addPriceError &&
    addCategoryId !== "";

  async function handleAddService() {
    if (!canAddService || !businessId || !authUser) return;
    setAdding(true);
    setAddError(null);
    try {
      const newService = await createService(businessId, {
        name: addName.trim(),
        description: addDescription.trim() || undefined,
        duration: addDurationNum,
        price: addPrice !== "" ? addPriceNum : undefined,
        categoryId: addCategoryId,
        userId: authUser.id,
      });
      // Assign staff member if selected
      if (addAssignedStaffId) {
        try {
          const assigned = await setServiceAssignment(businessId, newService.id, addAssignedStaffId);
          newService.assignedStaff = assigned.staffId
            ? { id: assigned.staffId, name: assigned.staffName ?? "", isOwner: assigned.isOwner }
            : null;
        } catch {
          // non-fatal — service created, assignment failed silently
        }
      }
      setServices((prev) => [...prev, newService]);
      setAddOpen(false);
    } catch {
      setAddError(t("serviceSelection.addService.error"));
    } finally {
      setAdding(false);
    }
  }

  function upcomingCountForService(serviceId: string): number {
    return appointments.filter((a) => a.serviceId === serviceId).length;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* Add Service Modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setAddOpen(false)}
        >
          <div
            className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-surface-dark shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-3">
              <MaterialIcon name="add_circle_outline" className="text-xl text-primary" />
              <h2 className="font-bold text-[#111418] dark:text-white text-base flex-1">
                {t("serviceSelection.addService.title")}
              </h2>
              <button type="button" onClick={() => setAddOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <MaterialIcon name="close" className="text-xl text-gray-500" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {addError && <Alert variant="error">{addError}</Alert>}
              <Input
                label={t("serviceEdit.nameLabel")}
                value={addName}
                onValueChange={setAddName}
                placeholder={t("serviceEdit.namePlaceholder")}
              />
              <Input
                label={t("serviceEdit.descriptionLabel")}
                value={addDescription}
                onValueChange={setAddDescription}
                placeholder={t("serviceEdit.descriptionPlaceholder")}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t("serviceEdit.durationLabel")}
                  type="number"
                  value={addDuration}
                  onValueChange={setAddDuration}
                  placeholder="30"
                  error={addDurationError}
                />
                <Input
                  label={t("serviceEdit.priceLabel")}
                  type="number"
                  value={addPrice}
                  onValueChange={setAddPrice}
                  placeholder="0"
                  error={addPriceError}
                />
              </div>
              <CategorySearchSelect
                label={t("serviceEdit.categoryLabel")}
                value={addCategoryId}
                onChange={setAddCategoryId}
                categories={categories}
                error={addCategoryId === "" ? t("onboarding.error.categoryRequired") : undefined}
                businessId={businessId}
              />
              {/* Staff assignment */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("serviceEdit.assignedToLabel")}
                </p>
                <select
                  value={addAssignedStaffId}
                  onChange={(e) => setAddAssignedStaffId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">{t("serviceEdit.unassigned")}</option>
                  {staffList.map((s) => (
                    <option key={s.userId} value={s.userId}>
                      {s.name}{s.isOwner ? ` (${t("staff.ownerBadge")})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setAddOpen(false)} disabled={adding}>
                  {t("buttons.cancel")}
                </Button>
                <Button variant="primary" onClick={handleAddService} isLoading={adding} disabled={!canAddService}>
                  {t("serviceSelection.addService.confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={t("common.back")}
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
              {t("serviceSelection.title")}
            </h1>
            <p className="text-xs text-gray-500">{t("serviceSelection.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
          >
            <MaterialIcon name="add" className="text-base" />
            {t("serviceSelection.addService.button")}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <MaterialIcon name="error_outline" className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && services.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MaterialIcon name="content_cut" className="text-3xl text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-[#111418] dark:text-white">{t("serviceSelection.empty.title")}</p>
              <p className="text-sm text-gray-500 mt-1">
                {t("serviceSelection.empty.text")}
              </p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
            >
              <MaterialIcon name="add" className="text-base" />
              {t("serviceSelection.addService.button")}
            </button>
          </div>
        )}

        {/* Service list */}
        {!loading &&
          services.map((svc) => {
            const upcoming = upcomingCountForService(svc.id);
            return (
              <Card key={svc.id} className="p-4">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <MaterialIcon name="content_cut" className="text-xl text-purple-600 dark:text-purple-400" />
                  </div>

                  {/* Info — display only */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#111418] dark:text-white text-sm truncate">
                      {svc.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MaterialIcon name="schedule" className="text-sm leading-none" />
                        {svc.duration} min
                      </span>
                      {svc.price != null && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <MaterialIcon name="payments" className="text-sm leading-none" />
                          ₪{svc.price.toFixed(2)}
                        </span>
                      )}
                      {upcoming > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                          <MaterialIcon name="event" className="text-xs leading-none" />
                          {t("serviceSelection.upcoming", { count: upcoming })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Availability / working hours */}
                    <button
                      type="button"
                      onClick={() => navigate(`/schedule/${businessId}/${svc.id}`)}
                      className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition"
                      aria-label={t("serviceSelection.editAvailability")}
                      title={t("serviceSelection.editAvailability")}
                    >
                      <MaterialIcon name="edit_calendar" className="text-lg" />
                    </button>

                    {/* Edit service details */}
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/${businessSlug}/services/${svc.id}/edit`)}
                      className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition"
                      aria-label={t("serviceSelection.editService")}
                      title={t("serviceSelection.editService")}
                    >
                      <MaterialIcon name="edit" className="text-lg" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}

        {/* Hint */}
        {!loading && services.length > 0 && (
          <p className="text-center text-xs text-gray-400 pt-2">
            {t("serviceSelection.hint")}
          </p>
        )}
      </div>
    </div>
  );
}
