import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Language Toggle Component
 * Allows switching between English and Hebrew
 * - Shows a language selection dialog when clicked
 * - Persists language choice to localStorage
 * - Automatically applies RTL/LTR based on language (except header)
 * - Updates HTML dir attribute
 */
export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);

  // Derive isHebrew from i18n.language instead of managing it as separate state
  const isHebrew = i18n.language === "he";

  // Update HTML attributes whenever language changes
  useEffect(() => {
    document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleLanguageSelect = async (lang: "en" | "he") => {
    if (i18n.language === lang) {
      setShowDialog(false);
      return;
    }

    // Change language and wait for it to complete
    await i18n.changeLanguage(lang);

    // Save language preference to localStorage
    localStorage.setItem("language", lang);

    // Close dialog after language change is complete
    setShowDialog(false);
  };

  const currentLang = isHebrew ? "עברית" : "English";

  if (compact) {
    // Compact button version
    return (
      <>
        <button
          onClick={() => setShowDialog(!showDialog)}
          className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          aria-label="Toggle language"
          aria-expanded={showDialog}
        >
          <span className="material-symbols-outlined text-slate-900 dark:text-white">
            language
          </span>
        </button>

        {/* Language Selection Popup */}
        {showDialog && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDialog(false)}
              aria-label="Close dialog"
            />

            {/* Dialog */}
            <div className="fixed top-16 right-4 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-50">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Select Language
                </h3>

                <div className="space-y-2">
                  {/* English Option */}
                  <button
                    onClick={() => handleLanguageSelect("en")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      !isHebrew
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <span className="text-sm font-medium">English</span>
                    {!isHebrew && (
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg ml-auto">
                        check
                      </span>
                    )}
                  </button>

                  {/* Hebrew Option */}
                  <button
                    onClick={() => handleLanguageSelect("he")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isHebrew
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <span className="text-sm font-medium">עברית</span>
                    {isHebrew && (
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg ml-auto">
                        check
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Full version with label (for sidebar)
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg cursor-pointer transition-colors"
      onClick={() => setShowDialog(!showDialog)}
    >
      <span className="material-symbols-outlined text-slate-900 dark:text-white">
        language
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {currentLang}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {isHebrew ? "Click to change" : "Click to change"}
        </div>
      </div>
      <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-lg">
        {showDialog ? "expand_less" : "expand_more"}
      </span>

      {/* Language Selection Dropdown */}
      {showDialog && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setShowDialog(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-50">
            <div className="p-2">
              {/* English Option */}
              <button
                onClick={() => handleLanguageSelect("en")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  !isHebrew
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                }`}
              >
                <span className="text-sm font-medium">English</span>
                {!isHebrew && (
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg ml-auto">
                    check
                  </span>
                )}
              </button>

              {/* Hebrew Option */}
              <button
                onClick={() => handleLanguageSelect("he")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  isHebrew
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                }`}
              >
                <span className="text-sm font-medium">עברית</span>
                {isHebrew && (
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg ml-auto">
                    check
                  </span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
