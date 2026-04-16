import { H1 } from "../UI/Typography";
import { LanguageToggle } from "../LanguageToggle";
import { DarkModeToggle } from "../DarkModeToggle";
import { NotificationBell } from "../NotificationBell";
import { AccessibilityMenuWidget } from "../AccessibilityMenu";
import { useAppSelector } from "../../redux/hooks";
import { selectIsAuthenticated } from "../../redux/authSelectors";

export const Header = ({
  onOpenMenu,
  menuButtonRef,
}: {
  onOpenMenu?: () => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between bg-background-light/90 p-4 backdrop-blur-sm dark:bg-background-dark/90"
      dir="ltr"
    >
      {/* Left: spacer to keep title centered */}
      <div className="w-10" />

      {/* Center */}
      <H1 className="flex-1 text-center">Appointly</H1>

      {/* Right: Dark mode toggle, language toggle, accessibility, notification bell (auth only), menu */}
      <div className="flex items-center gap-1 w-auto justify-end">
        <DarkModeToggle />
        <LanguageToggle compact={true} />
        <AccessibilityMenuWidget />
        {isAuthenticated && <NotificationBell />}
        <button
          ref={menuButtonRef}
          onClick={onOpenMenu}
          className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
          aria-label="Open menu"
          aria-haspopup="true"
        >
          <span
            className="material-symbols-outlined text-slate-900 dark:text-white"
            style={{ fontSize: "24px" }}
            aria-hidden="true"
          >
            menu
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
