import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SidebarIcon } from "./SidebarIcon";
import type { BusinessProfile } from "../../../types/business";

interface BusinessNavItemProps {
  business: BusinessProfile;
  onClose?: () => void;
}

export function BusinessNavItem({ business, onClose }: BusinessNavItemProps) {
  const { t } = useTranslation();
  const suspended = business.isSuspended === true;
  const [subExpanded, setSubExpanded] = useState(suspended);

  const slug = business.slug ?? business.id;

  const allLinks = [
    {
      label: t("sidebar.businessPage"),
      icon: "storefront",
      to: `/business/${slug}`,
      suspendedOnly: true,
    },
    {
      label: t("sidebar.dashboard"),
      icon: "dashboard",
      to: `/dashboard/${slug}`,
      suspendedOnly: true,
    },
    {
      label: t("sidebar.services"),
      icon: "content_cut",
      to: `/dashboard/${slug}/services`,
      suspendedOnly: false,
    },
    {
      label: t("sidebar.schedule"),
      icon: "calendar_month",
      to: `/business/${slug}/schedule`,
      suspendedOnly: false,
    },
    {
      label: t("sidebar.staffPartners"),
      icon: "group",
      to: `/dashboard/${slug}/staff`,
      suspendedOnly: false,
    },
  ];

  const visibleLinks = suspended
    ? allLinks.filter((l) => l.suspendedOnly)
    : allLinks;

  return (
    <div>
      <button
        onClick={() => setSubExpanded((v) => !v)}
        className={[
          "flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-colors",
          suspended
            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
        ].join(" ")}
      >
        <SidebarIcon
          name={suspended ? "block" : "store"}
          className={suspended ? "text-red-500 dark:text-red-400" : undefined}
        />
        <span className="flex-1 truncate text-left font-medium text-sm">
          {business.name}
        </span>
        <SidebarIcon
          name={subExpanded ? "expand_less" : "expand_more"}
          className="text-[16px]! text-gray-400 shrink-0"
        />
      </button>

      {subExpanded && (
        <div className="ltr:ml-4 rtl:mr-4 space-y-0.5 ltr:border-l rtl:border-r border-gray-200 dark:border-gray-700 ltr:pl-3 rtl:pr-3">
          {suspended && (
            <p className="px-2 py-1 text-xs text-red-500 dark:text-red-400 font-medium">
              Suspended
            </p>
          )}
          {visibleLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                ].join(" ")
              }
            >
              <SidebarIcon name={link.icon} className="text-[18px]!" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
