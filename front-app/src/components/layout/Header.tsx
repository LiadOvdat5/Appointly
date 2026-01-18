import React from "react";
import { GoSearch } from "react-icons/go";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { Link } from "react-router-dom";
import { LanguagesIcon } from "lucide-react";

export type HeaderProps = {
  onMenuClick?: () => void;
  onLoginClick?: () => void;
  onSearch?: (query: string) => void;
  onLanguageSwitch?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  appName?: string;
};

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onLanguageSwitch,
  onThemeToggle,
  isDarkMode = false,
  appName = "BizSlot",
}) => {
  const [search, setSearch] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(search);
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200 shadow-sm">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="font-extrabold text-2xl tracking-tight text-gray-900"
        >
          {appName}
        </Link>
      </div>

      {/* Center: Search */}
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm max-w-md w-full mx-6"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-4 py-2 text-sm focus:outline-none"
        />
        <button type="submit" className="px-4 hover:bg-gray-100 transition">
          <GoSearch size={18} />
        </button>
      </form>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg hover:bg-gray-200 transition"
        >
          {isDarkMode ? (
            <MdOutlineLightMode size={20} />
          ) : (
            <MdOutlineDarkMode size={20} />
          )}
        </button>

        {/* Language Switch */}
        <button
          onClick={onLanguageSwitch}
          className="p-2 rounded-lg hover:bg-gray-200 transition"
        >
          <LanguagesIcon size={20} />
        </button>
      </div>
    </header>
  );
};
