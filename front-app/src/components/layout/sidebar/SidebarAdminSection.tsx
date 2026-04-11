import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SidebarIcon } from "./SidebarIcon";

export function SidebarAdminSection({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation();
  const adminLinks = [
    {
      to: "/admin",
      label: t("sidebar.adminDashboard"),
      icon: "admin_panel_settings",
      end: true,
    },
    {
      to: "/admin/categories",
      label: t("sidebar.categoryRequests"),
      icon: "category",
      end: false,
    },
  ];

  return (
    <div className="mb-3">
      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {t("sidebar.adminSection")}
      </div>
      <div className="space-y-1">
        {adminLinks.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
              ].join(" ")
            }
          >
            <SidebarIcon name={icon} />
            <span className="truncate font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
