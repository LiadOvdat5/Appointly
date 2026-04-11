import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../MaterialIcon";

interface CategoryPreviewPanelProps {
  panelCls: string;
  previewName: string | null;
  previewIcon: string | null;
  requestError: string | null;
  isLoading: boolean;
  onConfirmRequest: () => void;
  onBack: () => void;
  onPickManually: () => void;
}

export function CategoryPreviewPanel({
  panelCls,
  previewName,
  previewIcon,
  requestError,
  isLoading,
  onConfirmRequest,
  onBack,
  onPickManually,
}: CategoryPreviewPanelProps) {
  const { t } = useTranslation();

  return (
    <div className={panelCls}>
      <button type="button" onClick={onBack} className="text-xs text-gray-500 hover:text-primary transition">
        {t("onboarding.step2.categorySuggestBack")}
      </button>
      <p className="text-sm font-semibold text-[#111418] dark:text-white flex items-center gap-2">
        <MaterialIcon name="auto_awesome" className="text-[16px]! text-primary" />
        {t("onboarding.step2.categoryPreviewTitle")}
      </p>

      {previewName ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          {previewIcon && (
            <MaterialIcon name={previewIcon} className="text-[22px]! text-primary shrink-0" />
          )}
          <div>
            <p className="text-sm font-bold text-primary">{previewName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t("onboarding.step2.categoryPreviewSubtext")}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">{t("onboarding.step2.categoryPreviewFailed")}</p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {t("onboarding.step2.categoryPreviewBody")}
      </p>

      {requestError && <p className="text-xs text-danger">{requestError}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPickManually}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          {t("onboarding.step2.categoryPreviewPickManually")}
        </button>
        <button
          type="button"
          onClick={onConfirmRequest}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t("onboarding.step2.categoryRequestLoading")}
            </>
          ) : (
            t("onboarding.step2.categoryRequestConfirm")
          )}
        </button>
      </div>
    </div>
  );
}
