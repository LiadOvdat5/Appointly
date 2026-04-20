import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useCurrency, CURRENCY_SYMBOLS, type CurrencyCode } from "../hooks/useCurrency";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/authSelectors";
import { updateUser } from "../api/user";

const CURRENCIES: CurrencyCode[] = ["ILS", "EUR", "USD"];

/**
 * Globe-icon button that opens a combined Language + Currency popup.
 * Language persists to localStorage via i18next.
 * Currency persists to localStorage via useCurrency.
 */
export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const { preferredCurrency, setPreferredCurrency } = useCurrency();
  const [showDialog, setShowDialog] = useState(false);
  const authUser = useAppSelector(selectUser);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const compactButtonRef = useRef<HTMLButtonElement>(null);

  const isHebrew = i18n.language === "he";

  useEffect(() => {
    document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleLanguageSelect = async (lang: "en" | "he") => {
    if (i18n.language !== lang) {
      await i18n.changeLanguage(lang);
      localStorage.setItem("language", lang);
      if (authUser?.id) {
        updateUser(authUser.id, { preferredLanguage: lang }).catch(() => {});
      }
    }
    setShowDialog(false);
  };

  const handleCurrencySelect = (currency: CurrencyCode) => {
    setPreferredCurrency(currency);
    setShowDialog(false);
  };

  const handleCompactToggle = () => {
    const next = !showDialog;
    if (next && compactButtonRef.current) {
      const rect = compactButtonRef.current.getBoundingClientRect();
      setDropdownStyle({ position: "fixed", top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setShowDialog(next);
  };

  const handleFullToggle = () => {
    const next = !showDialog;
    if (next && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({ position: "fixed", top: rect.bottom + 4, left: rect.left, minWidth: rect.width });
    }
    setShowDialog(next);
  };

  const popup = (
    <>
      <div className="fixed inset-0 z-9998" onClick={() => setShowDialog(false)} aria-label="Close dialog" />
      <div style={dropdownStyle} className="z-9999 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-52">
        {/* Language section */}
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {t("lang.selectLanguage")}
          </p>
          <div className="space-y-1">
            {(["en", "he"] as const).map((lang) => {
              const active = i18n.language === lang;
              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageSelect(lang)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-start ${
                    active
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {lang === "en" ? t("lang.english") : t("lang.hebrew")}
                  </span>
                  {active && (
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg ms-auto">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mx-3" />

        {/* Currency section */}
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {t("currency.selectCurrency")}
          </p>
          <div className="space-y-1">
            {CURRENCIES.map((code) => {
              const active = preferredCurrency === code;
              return (
                <button
                  key={code}
                  onClick={() => handleCurrencySelect(code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-start ${
                    active
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <span className="text-base leading-none">{CURRENCY_SYMBOLS[code]}</span>
                  <span className="text-sm font-medium">{t(`currency.${code}`)}</span>
                  {active && (
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg ms-auto">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  if (compact) {
    return (
      <>
        <button
          ref={compactButtonRef}
          onClick={handleCompactToggle}
          className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          aria-label="Toggle language and currency"
          aria-expanded={showDialog}
        >
          <span className="material-symbols-outlined text-slate-900 dark:text-white">
            language
          </span>
        </button>
        {showDialog && createPortal(popup, document.body)}
      </>
    );
  }

  // Full version used in the sidebar
  const currentLang = isHebrew ? t("lang.hebrew") : t("lang.english");
  return (
    <div
      ref={triggerRef}
      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg cursor-pointer transition-colors"
      onClick={handleFullToggle}
    >
      <span className="material-symbols-outlined text-slate-900 dark:text-white">
        language
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {currentLang} · {CURRENCY_SYMBOLS[preferredCurrency]}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {t("lang.selectLanguage")} / {t("currency.selectCurrency")}
        </div>
      </div>
      <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-lg">
        {showDialog ? "expand_less" : "expand_more"}
      </span>
      {showDialog && createPortal(popup, document.body)}
    </div>
  );
}
