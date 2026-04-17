import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getServicesForBusiness,
  getPublicBusinessBySlug,
  getBusinessById,
  updateService,
} from "../services/businessManagementService";
import { fetchCategories } from "../services/categoryService";
import {
  getStaff,
  getServiceAssignment,
  setServiceAssignment,
  updateAssignmentPreferences,
  type StaffMember,
  type ServiceAssignment,
} from "../services/staffService";
import type { ServiceProfile } from "../types/business";
import type { Category } from "../types/search";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { Alert } from "../components/UI/Alert";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { CategorySearchSelect } from "../components/UI/CategorySearchSelect";

export default function ServiceEditPage() {
  const { t } = useTranslation();
  const { businessSlug, serviceId } = useParams<{ businessSlug: string; serviceId: string }>();
  const navigate = useNavigate();

  const [businessId, setBusinessId] = useState<string>("");
  const [service, setService] = useState<ServiceProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Assignment state (US-02-G-01 / US-02-G-04)
  const [assignment, setAssignment] = useState<ServiceAssignment | null>(null);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!businessSlug) return;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessSlug);
    const resolve = isUUID ? getBusinessById(businessSlug) : getPublicBusinessBySlug(businessSlug);
    resolve
      .then((biz) => setBusinessId(biz.id))
      .catch(() => setLoadError(t("serviceEdit.error.loadFailed")));
  }, [businessSlug, t]);

  useEffect(() => {
    if (!businessId || !serviceId) return;
    setLoading(true);
    Promise.all([
      getServicesForBusiness(businessId),
      fetchCategories(),
      getServiceAssignment(businessId, serviceId).catch(() => null),
      getStaff(businessId).catch(() => []),
    ])
      .then(([svcs, cats, asgn, staff]) => {
        const found = svcs.find((s) => s.id === serviceId) ?? null;
        if (!found) { setLoadError(t("serviceEdit.error.notFound")); return; }
        setService(found);
        setName(found.name);
        setDescription(found.description ?? "");
        setDuration(String(found.duration));
        setPrice(found.price != null ? String(found.price) : "");
        setCategoryId(found.categoryId ?? "");
        setCategories(cats);
        setAssignment(asgn);
        setAllStaff(staff as StaffMember[]);
      })
      .catch(() => setLoadError(t("serviceEdit.error.loadFailed")))
      .finally(() => setLoading(false));
  }, [businessId, serviceId, t]);

  // ── Validation ────────────────────────────────────────────────────

  const durationNum = Number(duration);
  const priceNum = Number(price);
  const durationError =
    duration !== "" && (isNaN(durationNum) || durationNum <= 0)
      ? t("publicBusiness.durationPositive")
      : undefined;
  const priceError =
    price !== "" && (isNaN(priceNum) || priceNum < 0)
      ? t("publicBusiness.priceNotNegative")
      : undefined;

  const canSave =
    name.trim().length > 0 &&
    duration !== "" &&
    !durationError &&
    !priceError &&
    categoryId !== "";

  // ── Save ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!canSave || !businessId || !serviceId) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await updateService(businessId, serviceId, {
        name: name.trim(),
        description: description.trim() || undefined,
        duration: durationNum,
        price: price !== "" ? priceNum : undefined,
        categoryId,
      });
      setSaved(true);
    } catch {
      setSaveError(t("serviceEdit.error.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  // ── Assignment handlers (US-02-G-04) ─────────────────────────────

  async function handleSetAssignee(staffId: string | null) {
    if (!businessId || !serviceId) return;
    setAssignmentSaving(true);
    try {
      const updated = await setServiceAssignment(businessId, serviceId, staffId);
      setAssignment(updated);
      setShowStaffPicker(false);
    } catch {
      // silently ignore; user can retry
    } finally {
      setAssignmentSaving(false);
    }
  }

  async function handleToggleBlockOnBooking() {
    if (!businessId || !serviceId || assignment == null) return;
    const next = !assignment.blockOnBooking;
    setAssignment({ ...assignment, blockOnBooking: next });
    try {
      await updateAssignmentPreferences(businessId, serviceId, next);
    } catch {
      // revert on error
      setAssignment({ ...assignment, blockOnBooking: !next });
    }
  }

  // A service's assignee has "other services" when at least one more service in
  // allStaff's assignments is tied to the same person — we approximate by
  // checking the StaffMember.assignedServicesCount
  const assigneeStaffMember = assignment?.staffId
    ? allStaff.find((s) => s.userId === assignment.staffId)
    : null;
  const assigneeHasOtherServices = assigneeStaffMember
    ? assigneeStaffMember.assignedServicesCount >= 2
    : false;

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/${businessSlug}/services`)}
            className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={t("common.back")}
          >
            <MaterialIcon name="arrow_back" className="text-xl" />
          </button>
          <div>
            <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
              {service ? service.name : t("serviceEdit.title")}
            </h1>
            <p className="text-xs text-gray-500">{t("serviceEdit.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        )}

        {/* Load error */}
        {loadError && (
          <Alert variant="error">{loadError}</Alert>
        )}

        {/* Form */}
        {!loading && !loadError && service && (
          <div className="flex flex-col gap-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            {saved && (
              <Alert variant="success">{t("serviceEdit.savedSuccess")}</Alert>
            )}
            {saveError && (
              <Alert variant="error">{saveError}</Alert>
            )}

            <Input
              label={t("serviceEdit.nameLabel")}
              value={name}
              onValueChange={setName}
              placeholder={t("serviceEdit.namePlaceholder")}
            />

            <Input
              label={t("serviceEdit.descriptionLabel")}
              value={description}
              onValueChange={setDescription}
              placeholder={t("serviceEdit.descriptionPlaceholder")}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("serviceEdit.durationLabel")}
                type="number"
                value={duration}
                onValueChange={setDuration}
                placeholder="30"
                error={durationError}
              />
              <Input
                label={t("serviceEdit.priceLabel")}
                type="number"
                value={price}
                onValueChange={setPrice}
                placeholder="0"
                error={priceError}
              />
            </div>

            <CategorySearchSelect
              label={t("serviceEdit.categoryLabel")}
              value={categoryId}
              onChange={setCategoryId}
              categories={categories}
              error={categoryId === "" ? t("onboarding.error.categoryRequired") : undefined}
              businessId={businessId}
            />

            {/* ── Assigned To (US-02-G-04) ── */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("serviceEdit.assignedToLabel")}
              </p>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex-1 min-w-0">
                  {assignment?.staffId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#111418] dark:text-white truncate">
                        {assignment.staffName}
                      </span>
                      {assignment.isOwner && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide shrink-0">
                          {t("staff.ownerBadge")}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">{t("serviceEdit.unassigned")}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowStaffPicker((v) => !v)}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition shrink-0"
                >
                  {t("serviceEdit.changeAssignee")}
                </button>
              </div>

              {/* Staff picker dropdown */}
              {showStaffPicker && (
                <div className="mt-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-lg overflow-hidden">
                  {/* Unassign option */}
                  <button
                    type="button"
                    disabled={assignmentSaving}
                    onClick={() => handleSetAssignee(null)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition border-b border-gray-100 dark:border-gray-800"
                  >
                    <MaterialIcon name="person_off" className="text-base text-gray-400" />
                    {t("serviceEdit.unassign")}
                  </button>
                  {allStaff.map((s) => (
                    <button
                      key={s.userId}
                      type="button"
                      disabled={assignmentSaving}
                      onClick={() => handleSetAssignee(s.userId)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                        assignment?.staffId === s.userId
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-[#111418] dark:text-white"
                      }`}
                    >
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-xs">
                          {s.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                      </div>
                      <span className="flex-1 text-left truncate">{s.name}</span>
                      {s.isOwner && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide shrink-0">
                          {t("staff.ownerBadge")}
                        </span>
                      )}
                      {assignment?.staffId === s.userId && (
                        <MaterialIcon name="check" className="text-sm text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Block on booking toggle — only when assignee has 2+ services (US-02-G-04) */}
              {assignment?.staffId && assigneeHasOtherServices && (
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <div
                      role="switch"
                      aria-checked={assignment.blockOnBooking}
                      tabIndex={0}
                      onClick={handleToggleBlockOnBooking}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        handleToggleBlockOnBooking()
                      }
                      className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0 ${
                        assignment.blockOnBooking
                          ? "bg-primary"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          assignment.blockOnBooking ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111418] dark:text-white">
                        {t("serviceEdit.blockOnBookingLabel", {
                          name: assignment.staffName,
                        })}
                      </p>
                    </div>
                  </label>
                  {/* Info chip */}
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      assignment.blockOnBooking
                        ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                    }`}
                  >
                    <MaterialIcon
                      name={assignment.blockOnBooking ? "shield" : "remove_moderator"}
                      className="text-xs"
                    />
                    {assignment.blockOnBooking
                      ? t("serviceEdit.conflictProtectionOn")
                      : t("serviceEdit.conflictProtectionOff")}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleSave} isLoading={saving} disabled={!canSave}>
              {t("serviceEdit.saveButton")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
