import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useA11yPrefs, type FontSize } from "../hooks/useA11yPrefs";
import { Toggle } from "./UI/Toggle";

const FONT_SIZE_OPTIONS: { value: FontSize; labelKey: string }[] = [
  { value: "sm", labelKey: "accessibility.fontSize.sm" },
  { value: "default", labelKey: "accessibility.fontSize.default" },
  { value: "lg", labelKey: "accessibility.fontSize.lg" },
  { value: "xl", labelKey: "accessibility.fontSize.xl" },
];

export function AccessibilityButton({
  onOpen,
  isOpen,
}: {
  onOpen: () => void;
  isOpen: boolean;
}) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onOpen}
      aria-label={t("accessibility.buttonLabel")}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
    >
      <span
        className="material-symbols-outlined text-slate-900 dark:text-white"
        style={{ fontSize: "22px" }}
        aria-hidden="true"
      >
        accessibility_new
      </span>
    </button>
  );
}

export function AccessibilityMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { prefs, setFontSize, setHighContrast, setReduceMotion } =
    useA11yPrefs();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus the panel when it opens
  useEffect(() => {
    if (open) {
      firstFocusableRef.current?.focus();
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Trap focus inside panel
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  if (!open) return null;

  function handleReset() {
    setFontSize("default");
    setHighContrast(false);
    setReduceMotion(false);
  }

  return (
    <div className="fixed inset-0 z-50" dir="ltr">
      {/* Backdrop */}
      <button
        aria-label={t("buttons.close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        tabIndex={-1}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("accessibility.panelTitle")}
        className="absolute bottom-0 left-0 right-0 mx-auto max-w-lg rounded-t-2xl bg-white p-5 shadow-xl dark:bg-surface-dark sm:bottom-auto sm:top-16 sm:right-4 sm:left-auto sm:w-80 sm:rounded-2xl"
      >
        {/* Header row */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {t("accessibility.panelTitle")}
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            aria-label={t("buttons.close")}
            className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300" style={{ fontSize: "20px" }}>
              close
            </span>
          </button>
        </div>

        {/* Font size */}
        <section className="mb-5" aria-labelledby="a11y-fontsize-label">
          <p
            id="a11y-fontsize-label"
            className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t("accessibility.fontSize.label")}
          </p>
          <div className="flex gap-1" role="group" aria-labelledby="a11y-fontsize-label">
            {FONT_SIZE_OPTIONS.map(({ value, labelKey }) => (
              <button
                key={value}
                onClick={() => setFontSize(value)}
                aria-pressed={prefs.fontSize === value}
                className={[
                  "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors",
                  prefs.fontSize === value
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-slate-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-transparent dark:text-slate-300",
                ].join(" ")}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </section>

        {/* High contrast */}
        <section className="mb-4" aria-labelledby="a11y-contrast-label">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                id="a11y-contrast-label"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t("accessibility.highContrast.label")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("accessibility.highContrast.description")}
              </p>
            </div>
            <Toggle
              checked={prefs.highContrast}
              onChange={setHighContrast}
            />
          </div>
        </section>

        {/* Reduce motion */}
        <section className="mb-5" aria-labelledby="a11y-motion-label">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                id="a11y-motion-label"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t("accessibility.reduceMotion.label")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("accessibility.reduceMotion.description")}
              </p>
            </div>
            <Toggle
              checked={prefs.reduceMotion}
              onChange={setReduceMotion}
            />
          </div>
        </section>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full rounded-lg border border-gray-200 py-2 text-sm text-slate-600 transition-colors hover:border-primary hover:text-primary dark:border-gray-700 dark:text-slate-400"
        >
          {t("accessibility.reset")}
        </button>
      </div>
    </div>
  );
}

/** Convenience wrapper that manages open/close state internally */
export function AccessibilityMenuWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AccessibilityButton onOpen={() => setOpen(true)} isOpen={open} />
      <AccessibilityMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
