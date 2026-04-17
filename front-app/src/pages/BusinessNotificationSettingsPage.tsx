import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toggle } from "../components/UI/Toggle";
import { useTranslation } from "react-i18next";
import { getPublicBusinessBySlug } from "../services/businessManagementService";
import {
  updateBusinessNotificationSettings,
  getPushPreferences,
  updatePushPreferences,
  type BusinessNotificationSettings,
  type PushPreferences,
} from "../services/notificationService";
import { usePushSubscription } from "../hooks/usePushSubscription";
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
      <Toggle checked={enabled} onChange={onChange} disabled={disabled} />
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

  // Push preferences
  const { isSubscribed, permission, isLoading: pushLoading, subscribe, unsubscribe } = usePushSubscription();
  const [pushPrefs, setPushPrefs] = useState<PushPreferences | null>(null);
  const [prefsSaving, setPrefsSaving] = useState(false);

  useEffect(() => {
    if (!businessSlug) return;
    getPublicBusinessBySlug(businessSlug).then((b) => {
      setBusiness(b);
      setSettings({
        notifyOnNewBooking: b.notifyOnNewBooking ?? true,
        notifyOnCancellation: b.notifyOnCancellation ?? true,
      });
    });
    getPushPreferences().then(setPushPrefs).catch(() => {});
  }, [businessSlug]);

  async function handlePushPrefToggle(key: keyof PushPreferences, value: boolean) {
    if (!pushPrefs) return;
    const next = { ...pushPrefs, [key]: value };
    setPushPrefs(next);
    setPrefsSaving(true);
    try {
      await updatePushPreferences({ [key]: value });
    } catch {
      setPushPrefs(pushPrefs);
    } finally {
      setPrefsSaving(false);
    }
  }

  async function handleMasterToggle() {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  }

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

        {/* Push Notifications section */}
        <div className="mt-8">
          <h2 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">
            {t("pushPreferences.sectionTitle")}
          </h2>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            {t("pushPreferences.sectionDesc")}
          </p>

          {permission === "unsupported" && (
            <p className="text-sm text-slate-500 dark:text-slate-400 rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
              {t("pushPreferences.unsupported")}
            </p>
          )}
          {permission === "denied" && (
            <p className="text-sm text-amber-700 dark:text-amber-400 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4">
              {t("pushPreferences.permissionDenied")}
            </p>
          )}

          {permission !== "unsupported" && (
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white px-5 dark:divide-gray-800 dark:border-gray-700 dark:bg-surface-dark">
              <ToggleRow
                label={t("pushPreferences.masterToggle")}
                description={t("pushPreferences.masterToggleDesc")}
                enabled={isSubscribed ?? false}
                onChange={handleMasterToggle}
                disabled={pushLoading || permission === "denied"}
              />
            </div>
          )}

          {isSubscribed && pushPrefs && (
            <div className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white px-5 dark:divide-gray-800 dark:border-gray-700 dark:bg-surface-dark">
              {(
                [
                  ["pushBookingConfirm", "bookingConfirm", "bookingConfirmDesc"],
                  ["pushCancellations", "cancellations", "cancellationsDesc"],
                  ["pushReminders24h", "reminders24h", "reminders24hDesc"],
                  ["pushReminders1h", "reminders1h", "reminders1hDesc"],
                  ["pushReviewPrompt", "reviewPrompt", "reviewPromptDesc"],
                ] as [keyof PushPreferences, string, string][]
              ).map(([key, labelKey, descKey]) => (
                <ToggleRow
                  key={key}
                  label={t(`pushPreferences.${labelKey}`)}
                  description={t(`pushPreferences.${descKey}`)}
                  enabled={pushPrefs[key]}
                  onChange={(v) => handlePushPrefToggle(key, v)}
                  disabled={prefsSaving}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
