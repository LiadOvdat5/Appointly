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
    ])
      .then(([svcs, cats]) => {
        const found = svcs.find((s) => s.id === serviceId) ?? null;
        if (!found) { setLoadError(t("serviceEdit.error.notFound")); return; }
        setService(found);
        setName(found.name);
        setDescription(found.description ?? "");
        setDuration(String(found.duration));
        setPrice(found.price != null ? String(found.price) : "");
        setCategoryId(found.categoryId ?? "");
        setCategories(cats);
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

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
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
            />

            <Button onClick={handleSave} isLoading={saving} disabled={!canSave}>
              {t("serviceEdit.saveButton")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
