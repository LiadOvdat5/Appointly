// src/components/layout/RoleSidebar.tsx
import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectIsAuthenticated, selectUser } from "../../redux/authSelectors";
import { Button } from "../UI/Button";
import { logout } from "../../api/auth";
import { clearSession } from "../../redux/authSlice";
import { Role } from "../../constants/roles";

// If you have a roles enum in backend, mirror it here.
// Removed the local Role definition as it is now imported from constants.

type SidebarItem = {
  key: string;
  label: string;
  to: string;
  icon?: React.ReactNode;
  minRole?: Role; // visible only if role >= minRole
  roles?: Role[]; // visible only if role is in roles (if provided)
  matchExact?: boolean; // optional exact match
};

type SidebarSection = {
  key: string;
  title?: string;
  items: SidebarItem[];
};

type Props = {
  brand?: React.ReactNode; // top area (logo / title)
  className?: string;
  collapsedWidth?: string; // tailwind width classes
  expandedWidth?: string;
  sections?: SidebarSection[]; // override if you want
  onClose?: () => void;
};

/**
 * Generic collapsible sidebar with role-based links.
 * - Role comes from Redux: user.role (number)
 * - Collapsed/expanded is internal state
 * - Uses NavLink for active styling
 */
export function RoleSidebar({
  brand = <span className="font-bold tracking-tight">BizSlot</span>,
  className,
  expandedWidth = "w-[279px]",
  sections,
  onClose,
}: Props) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const role = (user?.role ?? Role.Guest) as Role;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const allSections = useMemo<SidebarSection[]>(
    () =>
      sections ?? [
        {
          key: "main",
          title: "Main",
          items: [
            {
              key: "home",
              label: "Home",
              to: "/",
              minRole: Role.Guest,
              icon: <Icon name="home" />,
            },
            {
              key: "search",
              label: "Search",
              to: "/search",
              minRole: Role.Guest,
              icon: <Icon name="search" />,
            },
            {
              key: "appointments",
              label: "My Appointments",
              to: "/appointments",
              minRole: Role.Client,
              icon: <Icon name="event_upcoming" />,
            },
            {
              key: "favorites",
              label: "Favorites",
              to: "/favorites",
              minRole: Role.Client,
              icon: <Icon name="favorite" />,
            },
          ],
        },
        {
          key: "business",
          title: "Business",
          items: [
            {
              key: "dashboard",
              label: "Dashboard",
              to: "/business/dashboard",
              minRole: Role.Owner,
              icon: <Icon name="dashboard" />,
            },
            {
              key: "services",
              label: "Services",
              to: "/business/services",
              minRole: Role.Owner,
              icon: <Icon name="content_cut" />,
            },
            {
              key: "schedule",
              label: "Schedule",
              to: "/business/schedule",
              minRole: Role.Owner,
              icon: <Icon name="calendar_month" />,
            },
            {
              key: "staff",
              label: "Staff / Partners",
              to: "/business/staff",
              minRole: Role.Owner,
              icon: <Icon name="group" />,
            },
          ],
        },
        {
          key: "account",
          title: "Account",
          items: [
            {
              key: "profile",
              label: "Profile",
              to: "/profile",
              minRole: Role.Client,
              icon: <Icon name="person" />,
            },
            {
              key: "settings",
              label: "Settings",
              to: "/settings",
              minRole: Role.Client,
              icon: <Icon name="settings" />,
            },
          ],
        },
      ],
    [sections],
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
    // TODO: navigate to login or home
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

          {
            <div className="min-w-0">
              <div className="truncate">{brand}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {user ? `Role: ${role}` : "Guest"}
              </div>
            </div>
          }
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
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    [
                      "group flex items-center gap-3 rounded-xl px-3 py-2",
                      "transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
                    ].join(" ")
                  }
                  title={item.label ? item.label : undefined}
                >
                  <span className="shrink-0">
                    {item.icon ?? <Icon name="circle" />}
                  </span>

                  {<span className="truncate font-medium">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
        {/* User Card */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900/40">
          <div className="size-9 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0">
            <Icon
              name="account_circle"
              className="text-gray-600 dark:text-gray-300"
            />
          </div>

          {
            <div className="flex items-center justify-between w-full">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {user?.name ?? "Guest"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user ? "Signed in" : "Not signed in"}
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
                    Logout
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
                    Login
                  </Button>
                )}
              </div>
            </div>
          }
        </div>
      </div>
    </aside>
  );
}

/** Minimal Material Symbol icon helper (assumes you already load Material Symbols font) */
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
