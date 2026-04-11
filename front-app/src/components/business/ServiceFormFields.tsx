import { useTranslation } from "react-i18next";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { Input } from "../UI/Input";
import { CategorySearchSelect } from "../UI/CategorySearchSelect";
import type { Category } from "../../types/search";

export interface DraftService {
  name: string;
  description: string;
  duration: string;
  price: string;
  categoryId: string;
}

export const emptyServiceDraft = (): DraftService => ({
  name: "",
  description: "",
  duration: "",
  price: "",
  categoryId: "",
});

interface ServiceFormFieldsProps {
  draft: DraftService;
  categories: Category[];
  businessId: string | undefined;
  isNew: boolean;
  isSaving: boolean;
  error: string | null;
  onField: (field: keyof DraftService, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ServiceFormFields({
  draft,
  categories,
  businessId,
  isNew,
  isSaving,
  error,
  onField,
  onSave,
  onCancel,
}: ServiceFormFieldsProps) {
  const { t } = useTranslation();

  const durationNum = Number(draft.duration);
  const priceNum = Number(draft.price);
  const durationError =
    draft.duration !== "" && (isNaN(durationNum) || durationNum <= 0)
      ? t("publicBusiness.durationPositive")
      : undefined;
  const priceError =
    draft.price !== "" && (isNaN(priceNum) || priceNum < 0)
      ? t("publicBusiness.priceNotNegative")
      : undefined;

  const canSave =
    draft.name.trim().length > 0 &&
    draft.duration !== "" &&
    !durationError &&
    !priceError &&
    draft.categoryId !== "";

  return (
    <Card className="p-5 flex flex-col gap-4 border-2 border-primary/30 bg-primary/5 dark:bg-primary/10">
      <p className="text-sm font-bold text-primary">
        {isNew ? t("publicBusiness.addService") : t("publicBusiness.editServiceTitle")}
      </p>

      <div className="grid grid-cols-1 gap-3">
        <Input
          label={t("publicBusiness.nameLabel")}
          value={draft.name}
          onValueChange={(v) => onField("name", v)}
          placeholder={t("publicBusiness.namePlaceholder")}
        />
        <Input
          label={t("publicBusiness.descriptionOptionalLabel")}
          value={draft.description}
          onValueChange={(v) => onField("description", v)}
          placeholder={t("publicBusiness.descriptionShortPlaceholder")}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("publicBusiness.durationLabel")}
            type="number"
            value={draft.duration}
            onValueChange={(v) => onField("duration", v)}
            placeholder="30"
            error={durationError}
          />
          <Input
            label={t("publicBusiness.priceLabel")}
            type="number"
            value={draft.price}
            onValueChange={(v) => onField("price", v)}
            placeholder="25.00"
            error={priceError}
          />
        </div>
        <CategorySearchSelect
          label={t("publicBusiness.categoryLabel")}
          value={draft.categoryId}
          onChange={(v) => onField("categoryId", v)}
          categories={categories}
          businessId={businessId}
        />
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex gap-2">
        <Button variant="primary" size="sm" className="flex-1" onClick={onSave} disabled={!canSave} isLoading={isSaving}>
          {isNew ? t("publicBusiness.addService") : t("buttons.save")}
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel} disabled={isSaving}>
          {t("buttons.cancel")}
        </Button>
      </div>
    </Card>
  );
}
