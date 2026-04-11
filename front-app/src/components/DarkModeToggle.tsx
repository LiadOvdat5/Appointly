import { useTranslation } from "react-i18next";
import { useDarkMode } from "../hooks/useDarkMode";

export function DarkModeToggle() {
  const { t } = useTranslation();
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      onClick={toggle}
      className="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
      aria-label={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
      title={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
    >
      <span
        className="material-symbols-outlined text-slate-900 dark:text-white"
        style={{ fontSize: "22px" }}
      >
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
