import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SidebarIcon } from "./SidebarIcon";

interface SidebarPartnerSectionProps {
  businessId: string;
  onClose?: () => void;
}

export function SidebarPartnerSection({
  businessId,
  onClose,
}: SidebarPartnerSectionProps) {
  const { t } = useTranslation();
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    import("../../../services/businessManagementService")
      .then(({ getPublicBusinessById }) => getPublicBusinessById(businessId))
      .then((b) => setBusinessName(b.name))
      .catch(() => setBusinessName(null));
  }, [businessId]);

  return (
    <div className="mb-3">
      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {t("sidebar.myWorkplace")}
      </div>
      <div className="space-y-1">
        <NavLink
          to={`/staff-dashboard/${businessId}`}
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
          <SidebarIcon name="store" />
          <span className="truncate font-medium text-sm">
            {businessName ?? t("sidebar.loading")}
          </span>
        </NavLink>
      </div>
    </div>
  );
}
