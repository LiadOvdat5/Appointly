// src/components/layout/RoleSidebar.tsx
import React, { useMemo, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectIsAuthenticated, selectUser } from "../../redux/authSelectors";
import { Button } from "../UI/Button";
import { logout } from "../../api/auth";
import { clearSession } from "../../redux/authSlice";
import { Role } from "../../constants/roles";
import { getMyBusinesses } from "../../services/businessManagementService";
import { getFollowedBusinesses } from "../../services/followService";
import { setOwnedBusinesses } from "../../features/business/businessSlice";
import type { BusinessProfile } from "../../types/business";

type SidebarItem = {
  key: string;
  label: string;
  to: string;
  icon?: React.ReactNode;
  minRole?: Role;
  roles?: Role[];
  matchExact?: boolean;
};

type SidebarSection = {
  key: string;
  title?: string;
  items: SidebarItem[];
};

type Props = {
  brand?: React.ReactNode;
  className?: string;
  expandedWidth?: string;
  sections?: SidebarSection[];
  onClose?: () => void;
};

export function RoleSidebar({
  brand = <span className="font-bold tracking-tight">BizSlot</span>,
  className,
  expandedWidth = "w-[279px]",
  sections,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const role = (user?.role ?? Role.Guest) as Role;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const ownedBusinesses = useAppSelector((s) => s.business.ownedBusinesses);
  const [businessesExpanded, setBusinessesExpanded] = useState(true);
  const [favoritesExpanded, setFavoritesExpanded] = useState(false);

  // Load owned businesses when the user is an Owner
  useEffect(() => {
    if (role >= Role.Owner) {
      getMyBusinesses()
        .then((businesses) => dispatch(setOwnedBusinesses(businesses)))
        .catch(() => {
          /* silently ignore — sidebar is non-critical */
        });
    }
  }, [role, dispatch]);

  const allSections = useMemo<SidebarSection[]>(
    () =>
      sections ?? [
        {
          key: "main",
          title: t("sidebar.mainSection"),
          items: [
            {
              key: "home",
              label: t("common.home"),
              to: "/",
              minRole: Role.Guest,
              icon: <Icon name="home" />,
            },
            {
              key: "search",
              label: t("sidebar.search"),
              to: "/search",
              minRole: Role.Guest,
              icon: <Icon name="search" />,
            },
            {
              key: "customer-dashboard",
              label: t("sidebar.dashboard"),
              to: "/customer-dashboard",
              minRole: Role.Client,
              icon: <Icon name="dashboard" />,
            },
            {
              key: "appointments",
              label: t("customerAppointments.title"),
              to: "/dashboard/customer",
              minRole: Role.Client,
              icon: <Icon name="event_upcoming" />,
            },
          ],
        },
        {
          key: "account",
          title: t("sidebar.accountSection"),
          items: [
            {
              key: "profile",
              label: t("profile.title"),
              to: "/profile",
              minRole: Role.Client,
              icon: <Icon name="person" />,
            },
            {
              key: "settings",
              label: t("settings.title"),
              to: "/settings",
              minRole: Role.Client,
              icon: <Icon name="settings" />,
            },
          ],
        },
      ],
    [sections, t],
  );

  const visibleSections = useMemo(() => {
    const canSee = (item: SidebarItem) => {
      if (item.roles && item.roles.length > 0) return item.roles.includes(role);
      if (item.minRole !== undefined) return role >= item.minRole;
      return true;
    };

    return allSections
      .map((s) => ({ ...s, items: s.items.filter(canSee) }))
      .filter((s) => s.items.length > 0);
  }, [allSections, role]);

  const handleLogout = async () => {
    await logout();
    dispatch(clearSession());
  };

  return (
    <aside
      className={[
        "h-full flex flex-col border-r",
        "bg-white text-[#111418] border-gray-200",
        "dark:bg-background-dark dark:text-white dark:border-gray-800",
        "transition-[width] duration-200",
        expandedWidth,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Top */}
      <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="calendar_clock" className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="truncate">{brand}</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {user ? t("sidebar.signedIn") : t("sidebar.notSignedIn")}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-auto p-2">
        {visibleSections.map((section) => (
          <div key={section.key} className="mb-3">
            {section.title && (
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end={item.matchExact}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    [
                      "group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
                    ].join(" ")
                  }
                  title={item.label}
                >
                  <span className="shrink-0">
                    {item.icon ?? <Icon name="circle" />}
                  </span>
                  <span className="truncate font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Partner section — only visible when user is a partner */}
        {role === Role.Partner && user?.businessId && (
          <PartnerSection businessId={user.businessId} onClose={onClose} />
        )}

        {/* Favorites — inline collapsible list for Client+ */}
        {role >= Role.Client && (
          <FavoritesSection
            expanded={favoritesExpanded}
            onToggle={() => setFavoritesExpanded((v) => !v)}
            onClose={onClose}
          />
        )}

        {/* Business section — Client: "Create your business" / Owner: collapsible list */}
        <BusinessSection
          role={role}
          ownedBusinesses={ownedBusinesses}
          expanded={businessesExpanded}
          onToggle={() => setBusinessesExpanded((v) => !v)}
          onClose={onClose}
        />
      </nav>

      {/* Bottom — user card */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900/40">
          <div className="size-9 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0">
            <Icon
              name="account_circle"
              className="text-gray-600 dark:text-gray-300"
            />
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {user?.name ?? t("sidebar.notSignedIn")}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user ? t("sidebar.signedIn") : t("sidebar.notSignedIn")}
              </div>
            </div>
            <div>
              {isAuthenticated ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    onClose?.();
                  }}
                >
                  {t("sidebar.logout")}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigate("/login");
                    onClose?.();
                  }}
                >
                  {t("sidebar.login")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Business section ──────────────────────────────────────────────────────────

function BusinessSection({
  role,
  ownedBusinesses,
  expanded,
  onToggle,
  onClose,
}: {
  role: Role;
  ownedBusinesses: BusinessProfile[];
  expanded: boolean;
  onToggle: () => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation();

  if (role === Role.Client) {
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
          <Icon name="add_business" />
          <span className="truncate font-medium">
            {t("sidebar.createBusiness")}
          </span>
        </NavLink>
      </div>
    );
  }

  if (role < Role.Owner) return null;

  return (
    <div className="mb-3">
      {/* Collapsible header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <span>{t("sidebar.myBusinesses")}</span>
        <Icon
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

          {/* Always show a link to add another business */}
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
            <Icon name="add" className="text-[18px]!" />
            <span className="font-medium">
              {t("sidebar.addAnotherBusiness")}
            </span>
          </NavLink>
        </div>
      )}
    </div>
  );
}

function BusinessNavItem({
  business,
  onClose,
}: {
  business: BusinessProfile;
  onClose?: () => void;
}) {
  const { t } = useTranslation();
  const [subExpanded, setSubExpanded] = useState(false);

  return (
    <div>
      {/* Business name row — clicking expands sub-links */}
      <button
        onClick={() => setSubExpanded((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <Icon name="store" />
        <span className="flex-1 truncate text-left font-medium text-sm">
          {business.name}
        </span>
        <Icon
          name={subExpanded ? "expand_less" : "expand_more"}
          className="text-[16px]! text-gray-400 shrink-0"
        />
      </button>

      {subExpanded && (
        <div className="ml-4 space-y-0.5 border-l border-gray-200 dark:border-gray-700 pl-3">
          {[
            {
              label: t("sidebar.businessPage"),
              icon: "storefront",
              to: `/business/${business.id}`,
            },
            {
              label: t("sidebar.dashboard"),
              icon: "dashboard",
              to: `/dashboard/${business.id}`,
            },
            {
              label: t("sidebar.services"),
              icon: "content_cut",
              to: `/business/${business.id}/services`,
            },
            {
              label: t("sidebar.schedule"),
              icon: "calendar_month",
              to: `/business/${business.id}/schedule`,
            },
            {
              label: t("sidebar.staffPartners"),
              icon: "group",
              to: `/dashboard/${business.id}/staff`,
            },
          ].map((link) => (
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
              <Icon name={link.icon} className="text-[18px]!" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Partner section ───────────────────────────────────────────────────────────

function PartnerSection({
  businessId,
  onClose,
}: {
  businessId: string;
  onClose?: () => void;
}) {
  const { t } = useTranslation();
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    import("../../services/businessManagementService")
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
          <Icon name="store" />
          <span className="truncate font-medium text-sm">
            {businessName ?? t("sidebar.loading")}
          </span>
        </NavLink>
      </div>
    </div>
  );
}

// ── Favorites section ─────────────────────────────────────────────────────────

function FavoritesSection({
  expanded,
  onToggle,
  onClose,
}: {
  expanded: boolean;
  onToggle: () => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Reload every time the section is opened so it stays fresh
  useEffect(() => {
    if (!expanded) return;
    const load = async () => {
      setLoading(true);
      try {
        const result = await getFollowedBusinesses();
        setBusinesses(result);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    load();
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
        <Icon name="favorite" className={expanded ? "icon-filled" : ""} />
        <span className="flex-1 truncate font-medium text-left">
          {t("sidebar.favorites")}
        </span>
        <Icon
          name={expanded ? "expand_less" : "expand_more"}
          className="text-[16px]! text-gray-400 shrink-0"
        />
      </button>

      {expanded && (
        <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-3 space-y-0.5 py-1">
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
                  navigate(`/business/${b.id}`);
                  onClose?.();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                <Icon name="storefront" className="text-[18px]! shrink-0" />
                <span className="truncate">{b.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** Minimal Material Symbol icon helper */
function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={[
        "material-symbols-outlined",
        "text-[22px] leading-none",
        "pointer-events-none select-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
