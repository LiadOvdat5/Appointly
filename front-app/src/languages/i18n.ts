import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  debug: true,
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        helloWorld: "Hello World",
        sidebar: {
          search: "Search",
          documentation: "Documentation",
          login: "Log In",
          signup: "Sign Up",
          followed: "Followed Businesses",
          dashboard: "Dashboard",
          logout: "Logout",
        },
        direction: {
          right: "right",
        },
        correctness: {
          right: "right",
        },
      },
    },
    he: {
      translation: {
        helloWorld: "שלום עולם",
        sidebar: {
          search: "חיפוש",
          documentation: "תיעוד",
          login: "התחברות",
          signup: "הרשמה",
          followed: "עסקים במעקב",
          dashboard: "לוח בקרה",
          logout: "התנתקות",
        },
        direction: {
          right: "ימינה",
        },
        correctness: {
          right: "צודק",
        },
      },
    },
  },
  //lng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
