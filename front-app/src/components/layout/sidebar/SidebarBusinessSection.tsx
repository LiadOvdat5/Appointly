import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SidebarIcon } from "./SidebarIcon";
import { BusinessNavItem } from "./BusinessNavItem";
import { Role } from "../../../constants/roles";
import type { BusinessProfile } from "../../../types/business";

interface SidebarBusinessSectionProps {
  role: Role;
  ownedBusinesses: BusinessProfile[];
  expanded: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export function SidebarBusinessSection({
  role,
  ownedBusinesses,
  expanded,
  onToggle,
  onClose,
}: SidebarBusinessSectionProps) {
  const { t } = useTranslation();

  if (role === Role.Client || role === Role.Partner) {
    return (
      <div className="mb-3">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t("sidebar.businessSection")}
        </div>
        <NavLink
          to="/onboarding"
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
          <SidebarIcon name="add_business" />
          <span className="truncate font-medium">{t("sidebar.createBusiness")}</span>
        </NavLink>
      </div>
    );
  }

  if (role < Role.Owner) return null;

  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <span>{t("sidebar.myBusinesses")}</span>
        <SidebarIcon
          name={expanded ? "expand_less" : "expand_more"}
          className="text-[16px]! text-gray-400"
        />
      </button>

      {expanded && (
        <div className="space-y-1">
          {ownedBusinesses.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
              {t("sidebar.noBusinesses")}
            </p>
          ) : (
            ownedBusinesses.map((b) => (
              <BusinessNavItem key={b.id} business={b} onClose={onClose} />
            ))
          )}

          <NavLink
            to="/onboarding"
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors text-[13px]",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
              ].join(" ")
            }
          >
            <SidebarIcon name="add" className="text-[18px]!" />
            <span className="font-medium">{t("sidebar.addAnotherBusiness")}</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}
