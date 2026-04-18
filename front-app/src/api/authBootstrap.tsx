import { useEffect, useRef } from "react";
import type { AxiosError } from "axios";
import { me } from "../api/auth";
import { useAppDispatch } from "../redux/hooks";
import { setSession, setGuest } from "../redux/authSlice";
import { useTranslation } from "react-i18next";

function toEpochMs(expiresAt: string) {
  const ms = new Date(expiresAt).getTime();
  return Number.isFinite(ms) ? ms : Date.now();
}

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();
  const languageInitialized = useRef(false);

  // Load language preference once on mount only
  useEffect(() => {
    if (languageInitialized.current) return;

    languageInitialized.current = true;
    const savedLanguage = localStorage.getItem("language") || "en";
    i18n.changeLanguage(savedLanguage);

    // Set HTML attributes for RTL/LTR
    document.documentElement.dir = savedLanguage === "he" ? "rtl" : "ltr";
    document.documentElement.lang = savedLanguage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - runs only once on mount

  useEffect(() => {
    (async () => {
      try {
        const session = await me();
        dispatch(
          setSession({
            user: session.user,
            expiresAt: toEpochMs(session.expiresAt),
          }),
        );
      } catch (err) {
        const status = (err as AxiosError).response?.status;
        if (status === 401 || status === 403) {
          // Token is definitively invalid — the user is a guest.
          dispatch(setGuest());
        }
        // Any other error (5xx, network, timeout) means the server is
        // temporarily unavailable. Leave status as "unknown" so the spinner
        // stays visible; the user can reload once the server wakes up.
      }
    })();
  }, [dispatch]);

  return <>{children}</>;
}
