import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SidebarIcon } from "./SidebarIcon";
import { getFollowedBusinesses } from "../../../services/followService";
import type { BusinessProfile } from "../../../types/business";

interface SidebarFavoritesSectionProps {
  expanded: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export function SidebarFavoritesSection({
  expanded,
  onToggle,
  onClose,
}: SidebarFavoritesSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    setLoading(true);
    getFollowedBusinesses()
      .then(setBusinesses)
      .catch(() => { /* silently ignore */ })
      .finally(() => setLoading(false));
  }, [expanded]);

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={[
          "group flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-colors",
          expanded
            ? "bg-primary/10 text-primary"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
        ].join(" ")}
      >
        <SidebarIcon name="favorite" className={expanded ? "icon-filled" : ""} />
        <span className="flex-1 truncate font-medium text-left">
          {t("sidebar.favorites")}
        </span>
        <SidebarIcon
          name={expanded ? "expand_less" : "expand_more"}
          className="text-[16px]! text-gray-400 shrink-0"
        />
      </button>

      {expanded && (
        <div className="ltr:ml-4 rtl:mr-4 ltr:border-l rtl:border-r border-gray-200 dark:border-gray-700 ltr:pl-3 rtl:pr-3 space-y-0.5 py-1">
          {loading ? (
            <div className="flex justify-center py-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          ) : businesses.length === 0 ? (
            <p className="px-2 py-2 text-xs text-gray-400 dark:text-gray-500">
              {t("sidebar.noFollowed")}
            </p>
          ) : (
            businesses.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  navigate(`/business/${b.slug ?? b.id}`);
                  onClose?.();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                <SidebarIcon name="storefront" className="text-[18px]! shrink-0" />
                <span className="truncate">{b.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
