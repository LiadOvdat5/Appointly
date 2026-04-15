import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "./Header";
import { RoleSidebar } from "./RoleSidebar";
import { OfflineBanner } from "./OfflineBanner";
import { useFocusTrap } from "../../hooks/useFocusTrap";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className=" bg-background-light dark:bg-background-dark">
      {/* Skip link — first focusable element; visible only on focus */}
      <a
        href="#main-content"
        className={[
          "sr-only focus:not-sr-only",
          "focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-9999",
          "focus:rounded-xl focus:bg-primary focus:text-white focus:px-4 focus:py-2",
          "focus:font-semibold focus:shadow-lg focus:outline-none",
        ].join(" ")}
      >
        {t("a11y.skipToMain")}
      </a>

      {/* Offline indicator — shown when network is unavailable */}
      <OfflineBanner />
      {/* Header */}
      <Header
        onOpenMenu={() => setSidebarOpen(!sidebarOpen)}
        menuButtonRef={menuButtonRef}
      />

      {/* Content area below header */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-lg pb-20 outline-none"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        <Outlet />
      </main>

      {/* Sidebar overlay (always available; contents filter by role) */}
      <SidebarOverlay
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        triggerRef={menuButtonRef}
      >
        <RoleSidebar onClose={() => setSidebarOpen(false)} />
      </SidebarOverlay>
    </div>
  );
}

function SidebarOverlay({
  open,
  onClose,
  triggerRef,
  children,
}: {
  open: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { containerRef } = useFocusTrap<HTMLDivElement>({
    active: open,
    returnRef: triggerRef,
  });

  if (!open) return null;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <button
        aria-label={t("buttons.close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        tabIndex={-1}
      />

      {/* Panel - right side (always LTR layout regardless of document direction) */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("buttons.menu")}
        className="absolute inset-y-0 right-0 w-70 max-w-[85vw]"
        dir="ltr"
      >
        <div className="h-full shadow-xl">
          {/* Make RoleSidebar fill height, but it should NOT be sticky now */}
          <div className="h-full bg-white dark:bg-background-dark border-l border-gray-200 dark:border-gray-800">
            {/* Optional top row inside drawer */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
              <span className="font-semibold">{t("buttons.menu")}</span>
              <button
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={t("buttons.close")}
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="h-[calc(100%-56px)] overflow-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
