import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPublicBusinessBySlug } from "../services/businessManagementService";
import {
  updateBusinessNotificationSettings,
  type BusinessNotificationSettings,
} from "../services/notificationService";
import type { BusinessProfile } from "../types/business";

// ── Toggle row component ──────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  enabled,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50 ${
          enabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BusinessNotificationSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { businessSlug } = useParams<{ businessSlug: string }>();

  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [settings, setSettings] = useState<BusinessNotificationSettings>({
    notifyOnNewBooking: true,
    notifyOnCancellation: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessSlug) return;
    getPublicBusinessBySlug(businessSlug).then((b) => {
      setBusiness(b);
      setSettings({
        notifyOnNewBooking: b.notifyOnNewBooking ?? true,
        notifyOnCancellation: b.notifyOnCancellation ?? true,
      });
    });
  }, [businessSlug]);

  const handleToggle = async (
    key: keyof BusinessNotificationSettings,
    value: boolean,
  ) => {
    if (!business) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateBusinessNotificationSettings(business.id, { [key]: value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError(t("common.errorOccurred"));
      // Revert optimistic update
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-background-dark/90">
        <button
          onClick={() => navigate(`/dashboard/${businessSlug}`)}
          className="flex size-9 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={t("buttons.back")}
        >
          <span className="material-symbols-outlined text-slate-700 dark:text-white" style={{ fontSize: "22px" }}>
            arrow_back
          </span>
        </button>
        <h1 className="text-base font-bold text-slate-900 dark:text-white">
          {t("dashboard.notificationSettings")}
        </h1>
        {saving && (
          <span className="ml-auto text-xs text-slate-400">{t("common.saving")}</span>
        )}
        {saved && (
          <span className="ml-auto text-xs text-green-500">{t("common.saved")}</span>
        )}
      </div>

      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Description */}
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {t("notificationSettings.description")}
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Toggle cards */}
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white px-5 dark:divide-gray-800 dark:border-gray-700 dark:bg-surface-dark">
          <ToggleRow
            label={t("notificationSettings.newBooking")}
            description={t("notificationSettings.newBookingDesc")}
            enabled={settings.notifyOnNewBooking}
            onChange={(v) => handleToggle("notifyOnNewBooking", v)}
            disabled={saving}
          />
          <ToggleRow
            label={t("notificationSettings.cancellation")}
            description={t("notificationSettings.cancellationDesc")}
            enabled={settings.notifyOnCancellation}
            onChange={(v) => handleToggle("notifyOnCancellation", v)}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}
