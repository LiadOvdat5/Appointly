import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  NotificationType,
  type NotificationDTO,
} from "../services/notificationService";

// ── Icon per notification type ────────────────────────────────────────────────
function typeIcon(type: NotificationType): string {
  switch (type) {
    case NotificationType.AppointmentBooked:
      return "event_available";
    case NotificationType.AppointmentCancelled:
      return "event_busy";
    case NotificationType.AppointmentReminder:
      return "notifications_active";
    case NotificationType.ReviewPrompt:
      return "star";
    case NotificationType.InvitationReceived:
      return "mail";
    default:
      return "notifications";
  }
}

// ── Fallback nav target (used only if targetPath is absent) ───────────────────
function fallbackNavTarget(type: NotificationType): string | null {
  switch (type) {
    case NotificationType.AppointmentBooked:
    case NotificationType.AppointmentCancelled:
    case NotificationType.AppointmentReminder:
    case NotificationType.ReviewPrompt:
      return "/customer-dashboard";
    case NotificationType.InvitationReceived:
      return "/invitations";
    default:
      return null;
  }
}

// ── Time-ago helper ───────────────────────────────────────────────────────────
function timeAgo(isoString: string, t: TFunction): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return t("notifications.timeAgo.justNow");
  if (diffMin < 60) return t("notifications.timeAgo.minutesAgo", { count: diffMin });
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return t("notifications.timeAgo.hoursAgo", { count: diffH });
  const diffD = Math.floor(diffH / 24);
  return t("notifications.timeAgo.daysAgo", { count: diffD });
}

const POLL_INTERVAL_MS = 60_000;

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Poll unread count ──────────────────────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently ignore — non-critical
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchUnreadCount]);

  // ── Load notifications when panel opens ───────────────────────────────────
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications(1, 20);
      setNotifications(data);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggle = () => {
    const next = !open;
    if (next && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelStyle({ position: "fixed", top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen(next);
    if (next) loadNotifications();
  };

  // ── Close on outside click or scroll ─────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  // ── Click a notification ──────────────────────────────────────────────────
  const handleNotificationClick = async (notification: NotificationDTO) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    const target =
      notification.targetPath ?? fallbackNavTarget(notification.type);
    setOpen(false);
    if (target) navigate(target);
  };

  // ── Mark all as read ──────────────────────────────────────────────────────
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // ── Render translated notification body ──────────────────────────────────
  const renderBody = (n: NotificationDTO): string => {
    try {
      return t(n.body, n.bodyParams ?? {});
    } catch {
      return n.body;
    }
  };

  const renderTitle = (n: NotificationDTO): string => {
    try {
      return t(n.title);
    } catch {
      return n.title;
    }
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
        aria-label={t("notifications.title")}
      >
        <span
          className="material-symbols-outlined text-slate-900 dark:text-white"
          style={{ fontSize: "24px" }}
        >
          notifications
        </span>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel — rendered via portal so it always sits above all stacking contexts */}
      {open && createPortal(
        <div
          ref={panelRef}
          style={panelStyle}
          className="z-9999 w-80 max-w-[calc(100vw-1rem)] rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <span className="font-semibold text-slate-900 dark:text-white">
              {t("notifications.title")}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                {t("common.loading")}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                {t("notifications.empty")}
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-gray-800 ${
                    !n.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  {/* Type icon */}
                  <span
                    className={`mt-0.5 shrink-0 material-symbols-outlined text-[20px] ${
                      !n.isRead ? "text-primary" : "text-slate-400"
                    }`}
                  >
                    {typeIcon(n.type)}
                  </span>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${
                        !n.isRead
                          ? "font-semibold text-slate-900 dark:text-white"
                          : "font-medium text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {renderTitle(n)}
                    </p>
                    <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {renderBody(n)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {timeAgo(n.createdAt, t)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
