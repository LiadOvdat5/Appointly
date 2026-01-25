import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { RoleSidebar } from "./RoleSidebar";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className=" bg-background-light dark:bg-background-dark">
      {/* Header */}
      <Header onOpenMenu={() => setSidebarOpen(!sidebarOpen)} />

      {/* Content area below header */}
      <main className="mx-auto w-full max-w-lg pb-20">
        <Outlet />
      </main>

      {/* Sidebar overlay (always available; contents filter by role) */}
      <SidebarOverlay open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <RoleSidebar />
      </SidebarOverlay>
    </div>
  );
}

function SidebarOverlay({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Panel - right side */}
      <div className="absolute inset-y-0 right-0 w-[280px] max-w-[85vw]">
        <div className="h-full shadow-xl">
          {/* Make RoleSidebar fill height, but it should NOT be sticky now */}
          <div className="h-full bg-white dark:bg-background-dark border-l border-gray-200 dark:border-gray-800">
            {/* Optional top row inside drawer */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
              <span className="font-semibold">Menu</span>
              <button
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="h-[calc(100%-56px)] overflow-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
