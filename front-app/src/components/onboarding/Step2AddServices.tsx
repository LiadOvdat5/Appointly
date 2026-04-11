import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createService } from "../../services/businessManagementService";
import { fetchCategories } from "../../services/categoryService";
import type { Category } from "../../types/search";
import type { CreateServiceInput } from "../../types/business";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import { Alert } from "../UI/Alert";
import { MaterialIcon } from "../UI/MaterialIcon";
import { CategorySearchSelect } from "../UI/CategorySearchSelect";
import { EMPTY_SERVICE, type ServiceDraft } from "./onboardingTypes";

interface Step2Props {
  businessId: string;
  ownerId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step2AddServices({ businessId, ownerId, onNext, onBack }: Step2Props) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<ServiceDraft>(EMPTY_SERVICE);
  const [services, setServices] = useState<CreateServiceInput[]>([]);
  const [touched, setTouched] = useState<Partial<Record<keyof ServiceDraft, boolean>>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const errors: Partial<Record<keyof ServiceDraft, string>> = {
    name: !draft.name.trim() ? t("onboarding.error.serviceNameRequired") : undefined,
    duration:
      !draft.duration || isNaN(Number(draft.duration)) || Number(draft.duration) <= 0
        ? t("onboarding.error.durationInvalid")
        : undefined,
    categoryId: !draft.categoryId ? t("onboarding.error.categoryRequired") : undefined,
  };

  const draftValid = !errors.name && !errors.duration && !errors.categoryId;

  const set = (key: keyof ServiceDraft) => (val: string) => {
    setDraft((d) => ({ ...d, [key]: val }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleAddService = async () => {
    setTouched({ name: true, duration: true, categoryId: true });
    if (!draftValid) return;

    setIsAdding(true);
    setAddError(null);
    try {
      const input: CreateServiceInput = {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        duration: Number(draft.duration),
        price: draft.price ? Number(draft.price) : undefined,
        categoryId: draft.categoryId,
        userId: ownerId,
      };
      await createService(businessId, input);
      setServices((prev) => [...prev, input]);
      setDraft(EMPTY_SERVICE);
      setTouched({});
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("onboarding.error.serviceNameRequired");
      setAddError(msg);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418] dark:text-white">
          {t("onboarding.step2.title")}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t("onboarding.step2.subtitle")}
        </p>
      </div>

      {/* Added services list */}
      {services.length > 0 && (
        <div className="flex flex-col gap-2">
          {services.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 px-3 py-2"
            >
              <MaterialIcon name="check_circle" className="text-success text-[18px]!" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111418] dark:text-white truncate">
                  {s.name}
                </p>
                <p className="text-xs text-gray-500">
                  {s.duration} min{s.price != null ? ` · ₪${s.price}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service draft form */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm font-semibold text-[#111418] dark:text-white">
          {services.length === 0 ? t("onboarding.step2.newService") : t("onboarding.step2.addAnother")}
        </p>

        {addError && <Alert variant="error">{addError}</Alert>}

        <Input
          label={t("onboarding.step2.serviceNameLabel")}
          placeholder={t("onboarding.step2.serviceNamePlaceholder")}
          value={draft.name}
          onValueChange={set("name")}
          error={touched.name ? errors.name : undefined}
        />

        <Input
          label={t("onboarding.step2.descriptionLabel")}
          placeholder={t("onboarding.step2.serviceDescPlaceholder")}
          value={draft.description}
          onValueChange={set("description")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("onboarding.step2.durationLabel")}
            type="number"
            placeholder={t("onboarding.step2.durationPlaceholder")}
            value={draft.duration}
            onValueChange={set("duration")}
            error={touched.duration ? errors.duration : undefined}
          />
          <Input
            label={t("onboarding.step2.priceLabel")}
            type="number"
            placeholder={t("onboarding.step2.pricePlaceholder")}
            value={draft.price}
            onValueChange={set("price")}
          />
        </div>

        <CategorySearchSelect
          label={t("onboarding.step2.categoryLabel")}
          value={draft.categoryId}
          onChange={set("categoryId")}
          categories={categories}
          error={touched.categoryId ? errors.categoryId : undefined}
          businessId={businessId}
        />

        <Button variant="secondary" onClick={handleAddService} isLoading={isAdding}>
          <MaterialIcon name="add" className="text-[18px]!" />
          {t("onboarding.step2.addServiceButton")}
        </Button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t("buttons.previous")}
        </Button>
        <Button
          onClick={onNext}
          disabled={services.length === 0}
          className="flex-1"
        >
          {t("buttons.next")}
        </Button>
      </div>
    </div>
  );
}
