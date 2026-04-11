import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../UI/MaterialIcon";

interface ReviewFlagModalProps {
  onSubmit: (reason: string) => void;
  onClose: () => void;
  submitting: boolean;
  error: string | null;
}

export function ReviewFlagModal({ onSubmit, onClose, submitting, error }: ReviewFlagModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-bold text-[#111418] dark:text-white text-base">{t("reviews.flag.title")}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{t("reviews.flag.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <MaterialIcon name="close" className="text-xl text-gray-500" />
          </button>
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("reviews.flag.placeholder")}
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-[#111418] dark:text-white outline-none resize-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-gray-400 text-right">{reason.length}/500</p>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onSubmit(reason)}
            disabled={!reason.trim() || submitting}
            className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <MaterialIcon name="flag" className="text-base" />
            )}
            {submitting ? t("reviews.flag.submitting") : t("reviews.flag.submitButton")}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm font-semibold py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {t("reviews.flag.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
