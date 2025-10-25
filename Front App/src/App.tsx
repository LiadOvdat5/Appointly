import { useTranslation } from "react-i18next";
import "./languages/i18n";
import { useEffect, useState } from "react";
import { Header } from "./components/layout/Header";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";

function App() {
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    // TODO: Turn on the following line
    // i18n.changeLanguage(navigator.language);
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
    // TODO: add logic to update the document body class for dark mode
    // document.body.classList.toggle('dark', !isDarkMode);
  };

  const handleLanguageSwitch = () => {
    setShowLangMenu(true);
  };

  const handleSelectLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <div className="flex">
      <Sidebar isLoggedIn={false} />
      <div className="flex-1">
        <Header
          onThemeToggle={handleThemeToggle}
          isDarkMode={isDarkMode}
          onLanguageSwitch={handleLanguageSwitch}
        />
        {showLangMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[220px] flex flex-col gap-4">
              <h3 className="font-bold text-lg mb-2">Select Language</h3>
              <button
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-left"
                onClick={() => handleSelectLanguage("en")}
              >
                English
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-left"
                onClick={() => handleSelectLanguage("he")}
              >
                Hebrew
              </button>
              <button
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowLangMenu(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <main>
          <Outlet /> {/* This renders the child route content */}
        </main>
      </div>
    </div>
  );
}

export default App;
