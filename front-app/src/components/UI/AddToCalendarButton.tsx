import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  buildGoogleCalendarUrl,
  downloadIcs,
  type AppointmentCalendarData,
} from "../../utils/calendarLink";
import { MaterialIcon } from "./MaterialIcon";

interface AddToCalendarButtonProps {
  appointment: AppointmentCalendarData;
  /** Extra CSS classes applied to the trigger button */
  className?: string;
}

/**
 * A button that opens a small dropdown with two options:
 *   1. "Google Calendar" — opens the pre-filled Google Calendar page in a new tab
 *   2. "Download .ics"   — triggers a browser download of a standard .ics file
 *
 * Keyboard accessible: Enter/Space opens the menu, Escape closes it, Tab/arrow keys
 * navigate the options.
 */
export function AddToCalendarButton({
  appointment,
  className = "",
}: AddToCalendarButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function handleGoogleCalendar() {
    window.open(buildGoogleCalendarUrl(appointment), "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  function handleDownloadIcs() {
    downloadIcs(appointment);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        aria-label={t("addToCalendar.ariaLabel")}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        <MaterialIcon name="calendar_add_on" className="text-sm leading-none" />
        {t("addToCalendar.button")}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-50 mt-1 right-0 min-w-[180px] rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleGoogleCalendar}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#111418] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <MaterialIcon name="open_in_new" className="text-base text-gray-500" />
            {t("addToCalendar.google")}
          </button>
          <div className="h-px bg-gray-100 dark:bg-gray-800" />
          <button
            type="button"
            role="menuitem"
            onClick={handleDownloadIcs}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#111418] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <MaterialIcon name="download" className="text-base text-gray-500" />
            {t("addToCalendar.ics")}
          </button>
        </div>
      )}
    </div>
  );
}
