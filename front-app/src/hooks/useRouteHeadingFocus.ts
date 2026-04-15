import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Moves focus to the page <h1> (or #main-content as a fallback) on every
 * route change so keyboard and screen-reader users know a navigation occurred.
 *
 * Call once at the app root (inside a Router context).
 */
export function useRouteHeadingFocus() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Small timeout lets the new page render before we try to focus
    const id = setTimeout(() => {
      const heading = document.querySelector<HTMLElement>("main h1");
      if (heading) {
        // Make temporarily focusable if it isn't already
        const hadTabIndex = heading.hasAttribute("tabindex");
        if (!hadTabIndex) heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: false });
        // Remove the injected tabindex so it doesn't disrupt natural tab order
        if (!hadTabIndex) heading.removeAttribute("tabindex");
      } else {
        document.getElementById("main-content")?.focus({ preventScroll: false });
      }
    }, 50);

    return () => clearTimeout(id);
  }, [pathname]);
}
