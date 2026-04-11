import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { MaterialIcon } from "../UI/MaterialIcon";

interface StaffInviteModalProps {
  onClose: () => void;
  onInvite: (email: string, message: string) => Promise<void>;
}

export function StaffInviteModal({ onClose, onInvite }: StaffInviteModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onInvite(email.trim(), message.trim());
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data
              ?.error ?? t("staff.error.inviteFailed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#111418] dark:text-white text-base">
            {t("staff.inviteModal.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MaterialIcon name="close" className="text-xl text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label={t("staff.inviteModal.emailLabel")}
            type="email"
            value={email}
            onValueChange={setEmail}
            placeholder={t("staff.inviteModal.emailPlaceholder")}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
              {t("staff.inviteModal.messageLabel")}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("staff.inviteModal.messagePlaceholder")}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-[#111418] dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <Button type="submit" variant="primary" isLoading={loading}>
            {t("staff.inviteModal.submitButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}
