import { useNavigate } from "react-router-dom";
import { H1 } from "../UI/Typography";
import { LanguageToggle } from "../LanguageToggle";
import { NotificationBell } from "../NotificationBell";
import { useAppSelector } from "../../redux/hooks";
import { selectIsAuthenticated } from "../../redux/authSelectors";

export const Header = ({ onOpenMenu }: { onOpenMenu?: () => void }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const canGoBack = true;

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between bg-background-light/90 p-4 backdrop-blur-sm dark:bg-background-dark/90"
      dir="ltr"
    >
      {/* Left: Back only when meaningful */}
      <div className="w-10">
        {canGoBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
            aria-label="Back"
          >
            <span
              className="material-symbols-outlined text-slate-900 dark:text-white"
              style={{ fontSize: "24px" }}
            >
              arrow_back
            </span>
          </button>
        )}
      </div>

      {/* Center */}
      <H1 className="flex-1 text-center">BizSlot</H1>

      {/* Right: Language toggle, notification bell (auth only), menu */}
      <div className="flex items-center gap-1 w-auto justify-end">
        <LanguageToggle compact={true} />
        {isAuthenticated && <NotificationBell />}
        <button
          onClick={onOpenMenu}
          className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <span
            className="material-symbols-outlined text-slate-900 dark:text-white"
            style={{ fontSize: "24px" }}
          >
            menu
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
