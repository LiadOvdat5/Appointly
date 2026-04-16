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
import { setOwnedBusinesses } from "../../features/business/businessSlice";
import { SidebarIcon } from "./sidebar/SidebarIcon";
import { SidebarBusinessSection } from "./sidebar/SidebarBusinessSection";
import { SidebarPartnerSection } from "./sidebar/SidebarPartnerSection";
import { SidebarFavoritesSection } from "./sidebar/SidebarFavoritesSection";
import { SidebarAdminSection } from "./sidebar/SidebarAdminSection";

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
  brand = <span className="font-bold tracking-tight">Appointly</span>,
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
              icon: <SidebarIcon name="home" />,
            },
            {
              key: "search",
              label: t("sidebar.search"),
              to: "/search",
              minRole: Role.Guest,
              icon: <SidebarIcon name="search" />,
            },
            {
              key: "customer-dashboard",
              label: t("sidebar.dashboard"),
              to: "/customer-dashboard",
              minRole: Role.Client,
              icon: <SidebarIcon name="dashboard" />,
            },
            {
              key: "appointments",
              label: t("customerAppointments.title"),
              to: "/dashboard/customer",
              minRole: Role.Client,
              icon: <SidebarIcon name="event_upcoming" />,
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
              icon: <SidebarIcon name="person" />,
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
            <SidebarIcon name="calendar_clock" className="text-primary" />
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
                    {item.icon ?? <SidebarIcon name="circle" />}
                  </span>
                  <span className="truncate font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Admin section */}
        {role === Role.Admin && <SidebarAdminSection onClose={onClose} />}

        {/* Partner section — visible for partners and for owners who are also staff */}
        {role === Role.Partner && user?.businessId && (
          <SidebarPartnerSection businessId={user.businessId} onClose={onClose} />
        )}
        {role === Role.Owner && user?.workplaceBusinessId && (
          <SidebarPartnerSection businessId={user.workplaceBusinessId} onClose={onClose} />
        )}

        {/* Favorites — inline collapsible list for Client+ */}
        {role >= Role.Client && (
          <SidebarFavoritesSection
            expanded={favoritesExpanded}
            onToggle={() => setFavoritesExpanded((v) => !v)}
            onClose={onClose}
          />
        )}

        {/* Business section — Client: "Create your business" / Owner: collapsible list */}
        <SidebarBusinessSection
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
            <SidebarIcon
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
