import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { useFocusTrap } from "../../hooks/useFocusTrap";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Ref to the element that opened this dialog — focus returns here on close */
  triggerRef?: React.RefObject<HTMLElement | null>;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
  triggerRef,
}: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const resolvedConfirm = confirmLabel ?? t("buttons.confirm");
  const resolvedCancel = cancelLabel ?? t("buttons.cancel");

  const { containerRef } = useFocusTrap<HTMLDivElement>({
    active: open,
    returnRef: triggerRef,
  });

  if (!open) return null;

  function handleBackdropKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
      onKeyDown={handleBackdropKeyDown}
    >
      {/* Panel */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h2
            id={titleId}
            className="font-bold text-[#111418] dark:text-white text-base"
          >
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {resolvedCancel}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              destructive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-primary hover:bg-primary/90 text-on-primary",
            ].join(" ")}
          >
            {resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
