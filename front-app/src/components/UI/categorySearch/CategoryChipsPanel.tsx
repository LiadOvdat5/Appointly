import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../MaterialIcon";
import type { Category } from "../../../types/search";

interface CategoryChipsPanelProps {
  panelCls: string;
  isLoading: boolean;
  suggestions: Category[];
  onSelect: (cat: Category) => void;
  onBack: () => void;
  onNoneMatch: () => void;
}

export function CategoryChipsPanel({
  panelCls,
  isLoading,
  suggestions,
  onSelect,
  onBack,
  onNoneMatch,
}: CategoryChipsPanelProps) {
  const { t } = useTranslation();

  return (
    <div className={panelCls}>
      <button type="button" onClick={onBack} className="text-xs text-gray-500 hover:text-primary transition">
        {t("onboarding.step2.categorySuggestBack")}
      </button>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          {t("onboarding.step2.categorySuggestLoading")}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat)}
              className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition"
            >
              {cat.iconName && <MaterialIcon name={cat.iconName} className="text-[14px]!" />}
              {cat.name}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onNoneMatch}
        className="text-xs text-gray-500 hover:text-primary transition text-left"
      >
        {t("onboarding.step2.categorySuggestNoneMatch")}
      </button>
    </div>
  );
}
