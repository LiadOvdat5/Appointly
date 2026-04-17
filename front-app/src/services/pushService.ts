import { apiClient } from "./apiClient";

let cachedVapidKey: string | null = null;

async function getVapidPublicKey(): Promise<string | null> {
  if (cachedVapidKey) return cachedVapidKey;
  try {
    const res = await apiClient.get<{ publicKey: string }>("/api/push/vapid-public-key");
    cachedVapidKey = res.data.publicKey;
    return cachedVapidKey;
  } catch {
    return null;
  }
}

/** Convert a base64url string to a Uint8Array for use with pushManager.subscribe. */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output.buffer;
}

export async function subscribeDevice(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const vapidKey = await getVapidPublicKey();
  if (!vapidKey) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    const { endpoint, keys } = subscription.toJSON() as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    await apiClient.post("/api/push/subscriptions", {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: navigator.userAgent.slice(0, 300),
    });

    return true;
  } catch {
    return false;
  }
}

export async function unsubscribeDevice(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const { endpoint } = subscription.toJSON() as { endpoint: string };

    await subscription.unsubscribe();
    await apiClient.delete("/api/push/subscriptions", { data: { endpoint } });
  } catch {
    // Ignore — best effort
  }
}

/** Returns true if this device has an active push subscription registered with the backend. */
export async function isDeviceSubscribed(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
}
