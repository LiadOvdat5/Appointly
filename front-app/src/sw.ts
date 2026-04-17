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

// ── Push Notifications ────────────────────────────────────────────────────────
// Receives push payloads from the backend (VAPID) and shows a native notification.
self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json() ?? {};
  const title: string = data.title ?? "Appointly";
  const options: NotificationOptions = {
    body: data.body ?? "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    data: { url: data.url ?? "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Opens the relevant app URL when the user taps a notification.
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url: string = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients: readonly WindowClient[]) => {
        // Focus an existing open window/tab if available
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});

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
