import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { Button } from "../UI/Button";
import { MaterialIcon } from "../UI/MaterialIcon";
import { sendBroadcast, type BroadcastStatusDTO } from "../../services/broadcastService";

const TITLE_MAX = 100;
const BODY_MAX = 500;

interface Props {
  businessId: string;
  followerCount: number;
  status: BroadcastStatusDTO | null;
  onClose: () => void;
  onSent: (followerCount: number) => void;
}

export function BroadcastModal({ businessId, followerCount, status, onClose, onSent }: Props) {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { containerRef } = useFocusTrap<HTMLDivElement>({ active: true });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRateLimited = status !== null && status.sentToday >= status.dailyLimit;
  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending && !isRateLimited;

  async function handleSend() {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const result = await sendBroadcast(businessId, title.trim(), body.trim());
      onSent(result.followerCount);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { resetsAt?: string } } };
      if (axiosErr?.response?.status === 429) {
        const resetsAt = axiosErr?.response?.data?.resetsAt;
        const resetTime = resetsAt ? new Date(resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
        setError(t("broadcast.rateLimitError", { time: resetTime }));
      } else {
        setError(t("common.error"));
      }
    } finally {
      setSending(false);
    }
  }

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  const resetTime = status?.resetsAt
    ? new Date(status.resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdrop}
      onKeyDown={handleKey}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="broadcast-modal-title"
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-surface-dark shadow-xl flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
              <MaterialIcon name="campaign" className="text-lg text-rose-500" />
            </div>
            <h2 id="broadcast-modal-title" className="font-bold text-[#111418] dark:text-white text-base">
              {t("broadcast.modalTitle")}
            </h2>
          </div>
          <button
            ref={triggerRef}
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            aria-label={t("common.close")}
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        {/* Rate-limit banner */}
        {status && (
          <div className={`mx-5 mt-4 rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 ${
            isRateLimited
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
          }`}>
            <MaterialIcon name={isRateLimited ? "block" : "info"} className="text-base shrink-0" />
            <span>
              {isRateLimited
                ? t("broadcast.rateLimitExhausted", { time: resetTime })
                : t("broadcast.rateLimitBanner", {
                    remaining: status.dailyLimit - status.sentToday,
                    limit: status.dailyLimit,
                  })}
            </span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Recipient preview */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {followerCount === 0
              ? t("broadcast.recipientPreviewNone")
              : t("broadcast.recipientPreview", { count: followerCount })}
          </p>

          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#111418] dark:text-white">
                {t("broadcast.titleLabel")}
              </label>
              <span className={`text-xs ${title.length > TITLE_MAX ? "text-red-500" : "text-gray-400"}`}>
                {t("broadcast.chars", { current: title.length, max: TITLE_MAX })}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX + 10}
              placeholder={t("broadcast.titlePlaceholder")}
              disabled={isRateLimited || sending}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-[#111418] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#111418] dark:text-white">
                {t("broadcast.bodyLabel")}
              </label>
              <span className={`text-xs ${body.length > BODY_MAX ? "text-red-500" : "text-gray-400"}`}>
                {t("broadcast.chars", { current: body.length, max: BODY_MAX })}
              </span>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={BODY_MAX + 10}
              rows={4}
              placeholder={t("broadcast.bodyPlaceholder")}
              disabled={isRateLimited || sending}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-[#111418] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <MaterialIcon name="error_outline" className="text-base shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={sending}>
            {t("buttons.cancel")}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSend}
            disabled={!canSend || title.length > TITLE_MAX || body.length > BODY_MAX}
          >
            {sending ? t("broadcast.sending") : t("broadcast.sendButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
