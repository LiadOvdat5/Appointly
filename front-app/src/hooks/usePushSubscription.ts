import { useCallback, useEffect, useState } from "react";
import {
  isDeviceSubscribed,
  subscribeDevice,
  unsubscribeDevice,
} from "../services/pushService";

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

interface UsePushSubscriptionReturn {
  /** Whether this device is subscribed to push. Null while loading. */
  isSubscribed: boolean | null;
  /** Resolved OS permission state. */
  permission: PushPermission;
  /** True while a subscribe/unsubscribe request is in flight. */
  isLoading: boolean;
  /** Subscribe this device. Returns false if permission denied or unsupported. */
  subscribe: () => Promise<boolean>;
  /** Unsubscribe this device. */
  unsubscribe: () => Promise<void>;
}

export function usePushSubscription(): UsePushSubscriptionReturn {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      setIsSubscribed(false);
      return;
    }
    setPermission(Notification.permission as PushPermission);
    isDeviceSubscribed().then(setIsSubscribed);
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const ok = await subscribeDevice();
      if (ok) {
        setIsSubscribed(true);
        setPermission("granted");
      } else {
        const perm = "Notification" in window ? (Notification.permission as PushPermission) : "unsupported";
        setPermission(perm);
      }
      return ok;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await unsubscribeDevice();
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isSubscribed, permission, isLoading, subscribe, unsubscribe };
}
