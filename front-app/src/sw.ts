/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

// Workbox injects the precache manifest here at build time
precacheAndRoute(self.__WB_MANIFEST);

// Remove cached entries from old service worker versions
cleanupOutdatedCaches();

// Navigation requests: try network first, fall back to cache, then offline page.
// This allows the React SPA to work offline (index.html is precached) while
// serving offline.html as a last-resort fallback when nothing is cached.
const navigationHandler = new NetworkFirst({
  cacheName: "navigation-cache",
});

registerRoute(
  new NavigationRoute(async (params) => {
    try {
      return await navigationHandler.handle(params);
    } catch {
      const offlinePage = await caches.match("/offline.html");
      return (
        offlinePage ??
        new Response("You are offline", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        })
      );
    }
  })
);

// Static assets: serve from cache immediately, update in background
registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font",
  new StaleWhileRevalidate({
    cacheName: "static-assets",
  })
);
