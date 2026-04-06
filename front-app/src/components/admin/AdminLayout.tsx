import { NavLink, Outlet } from "react-router-dom";
import { MaterialIcon } from "../UI/MaterialIcon";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/admin/flagged-reviews", label: "Flagged Reviews", icon: "flag" },
  { to: "/admin/users", label: "Users", icon: "group" },
  { to: "/admin/businesses", label: "Businesses", icon: "storefront" },
  { to: "/admin/categories", label: "Categories", icon: "category" },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
        <div className="px-5 py-5 border-b border-slate-200 dark:border-slate-700">
          <span className="text-sm font-bold tracking-widest uppercase text-primary">
            BizSlot Admin
          </span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                ].join(" ")
              }
            >
              <MaterialIcon name={icon} className="text-[20px]" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
