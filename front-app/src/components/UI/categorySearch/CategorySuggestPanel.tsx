import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../MaterialIcon";

interface CategorySuggestPanelProps {
  panelCls: string;
  description: string;
  onDescriptionChange: (val: string) => void;
  suggestError: string | null;
  isLoading: boolean;
  onSuggest: () => void;
  onBack: () => void;
}

export function CategorySuggestPanel({
  panelCls,
  description,
  onDescriptionChange,
  suggestError,
  isLoading,
  onSuggest,
  onBack,
}: CategorySuggestPanelProps) {
  const { t } = useTranslation();
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={panelCls}>
      <button type="button" onClick={onBack} className="text-xs text-gray-500 hover:text-primary transition">
        {t("onboarding.step2.categorySuggestBack")}
      </button>
      <p className="text-sm font-semibold text-[#111418] dark:text-white flex items-center gap-2">
        <MaterialIcon name="auto_awesome" className="text-[16px]! text-primary" />
        {t("onboarding.step2.categorySuggestTitle")}
      </p>
      <textarea
        ref={descTextareaRef}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder={t("onboarding.step2.categorySuggestPlaceholder")}
        rows={3}
        autoFocus
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm text-[#111418] dark:text-white outline-none resize-none focus:ring-2 focus:ring-primary transition"
      />
      {suggestError && <p className="text-xs text-danger">{suggestError}</p>}
      <button
        type="button"
        onClick={onSuggest}
        disabled={isLoading || !description.trim()}
        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {t("onboarding.step2.categorySuggestLoading")}
          </>
        ) : (
          <>
            <MaterialIcon name="search" className="text-[16px]!" />
            {t("onboarding.step2.categorySuggestButton")}
          </>
        )}
      </button>
    </div>
  );
}
