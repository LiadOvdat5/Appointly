import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {
  getSeenTutorials,
  markTutorialSeenOnServer,
} from "../services/tutorialService";

const STORAGE_KEY = "tutorials-seen";

function readLocalSeen(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeLocalSeen(map: Record<string, boolean>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/**
 * useTutorial — manages the seen-state for a single tutorial page.
 *
 * @param tutorialKey  Unique key for this page's tutorial (e.g. "search").
 *
 * Returns:
 *  - isActive: boolean — whether the tutorial should currently be shown
 *  - markSeen: () => void — call when the user skips or finishes
 *  - replay: () => void — re-shows the tutorial in the current session
 */
export function useTutorial(tutorialKey: string) {
  const isAuthenticated = useSelector(
    (s: RootState) => s.auth.status === "authenticated",
  );

  // null = loading, true/false = resolved
  const [seen, setSeen] = useState<boolean | null>(null);
  const syncedRef = useRef(false);

  // On mount: resolve seen-state from localStorage, then merge with server if logged in.
  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      const local = readLocalSeen();

      if (local[tutorialKey]) {
        // Already seen locally — no need to hit the server.
        setSeen(true);
        return;
      }

      if (!isAuthenticated) {
        // Guest: rely solely on localStorage.
        setSeen(false);
        return;
      }

      // Authenticated: fetch server state and merge.
      try {
        const serverSeen = await getSeenTutorials();
        if (cancelled) return;

        // Merge: write any server-seen keys into localStorage.
        const merged = { ...local, ...serverSeen };
        writeLocalSeen(merged);

        // Push any locally-seen keys not yet on the server.
        const unsyncedKeys = Object.keys(local).filter(
          (k) => local[k] && !serverSeen[k],
        );
        for (const k of unsyncedKeys) {
          markTutorialSeenOnServer(k).catch(() => {/* best-effort */});
        }

        setSeen(!!merged[tutorialKey]);
        syncedRef.current = true;
      } catch {
        // If the network request fails, fall back to localStorage.
        if (!cancelled) setSeen(false);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorialKey, isAuthenticated]);

  const markSeen = useCallback(() => {
    setSeen(true);

    const local = readLocalSeen();
    local[tutorialKey] = true;
    writeLocalSeen(local);

    if (isAuthenticated) {
      markTutorialSeenOnServer(tutorialKey).catch(() => {/* best-effort */});
    }
  }, [tutorialKey, isAuthenticated]);

  const replay = useCallback(() => {
    setSeen(false);
  }, []);

  return {
    /** true = tutorial should run, false = already seen, null = still loading */
    isActive: seen === false,
    isLoading: seen === null,
    markSeen,
    replay,
  };
}
