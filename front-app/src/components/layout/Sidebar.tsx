import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  BookOpenText,
  LogIn,
  LogOut,
  UserPlus,
  LayoutDashboard,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  isLoggedIn: boolean;
}

export default function Sidebar({ isLoggedIn }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-15"
      } bg-black text-white h-screen p-4 flex flex-col transition-all duration-300`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-4 flex items-center"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-4">
        {/* Always visible */}
        <Link
          to="/search"
          className="flex items-center gap-2 hover:text-gray-400"
        >
          <Search size={20} />
          {isOpen && <span>{t("sidebar.search")}</span>}
        </Link>

        <Link
          to="/ui-showcase"
          className="flex items-center gap-2 hover:text-gray-400"
        >
          <BookOpenText size={20} />
          {isOpen && <span>{t("sidebar.documentation")}</span>}
        </Link>

        {/* Only Logged Out users visible */}
        {!isLoggedIn && (
          <>
            <Link
              to="/login"
              className="flex items-center gap-2 hover:text-gray-400"
            >
              <LogIn size={20} />
              {isOpen && <span>{t("sidebar.login")}</span>}
            </Link>

            <Link
              to="/signup"
              className="flex items-center gap-2 hover:text-gray-400"
            >
              <UserPlus size={20} />
              {isOpen && <span>{t("sidebar.signup")}</span>}
            </Link>
          </>
        )}

        {/* Only Logged In users visible */}
        {isLoggedIn && (
          <>
            <Link
              to="/followed"
              className="flex items-center gap-2 hover:text-gray-400"
            >
              <Star size={20} />
              {isOpen && <span>{t("sidebar.followed")}</span>}
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center gap-2 hover:text-gray-400"
            >
              <LayoutDashboard size={20} />
              {isOpen && <span>{t("sidebar.dashboard")}</span>}
            </Link>

            <Link
              to="/logout"
              className="flex items-center gap-2 hover:text-gray-400"
            >
              <LogOut size={20} />
              {isOpen && <span>{t("sidebar.logout")}</span>}
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
