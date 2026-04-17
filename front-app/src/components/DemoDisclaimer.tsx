import { useState } from "react";
import { useTranslation } from "react-i18next";

const DISMISSED_KEY = "appointly_demo_dismissed";

interface DemoUser {
  label: string;
  email: string;
  password: string;
  role: "owner" | "customer" | "admin";
}

const DEMO_USERS: DemoUser[] = [
  {
    label: "Business Owner",
    email: "owner@demo.appointly.com",
    password: "Demo1234!",
    role: "owner",
  },
  {
    label: "Customer",
    email: "customer@demo.appointly.com",
    password: "Demo1234!",
    role: "customer",
  },
  {
    label: "Admin",
    email: "admin@demo.appointly.com",
    password: "Demo1234!",
    role: "admin",
  },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
      aria-label={copied ? "Copied" : `Copy ${value}`}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}

function RoleBadge({ role }: { role: DemoUser["role"] }) {
  const colors = {
    owner: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    customer: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colors[role]}`}>
      {role}
    </span>
  );
}

export function DemoDisclaimer() {
  const { t, i18n } = useTranslation();
  const isHe = i18n.language.startsWith("he");

  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === "true",
  );
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[10000] border-t border-amber-200 bg-amber-50 shadow-lg dark:border-amber-700/50 dark:bg-amber-950/90"
      dir={isHe ? "rtl" : "ltr"}
      role="banner"
    >
      <div className="mx-auto max-w-2xl px-4 py-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <span className="text-lg leading-none">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                {t("demo.title", "Demo Environment")}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t(
                  "demo.subtitle",
                  "This is a demo build. Data may be reset at any time.",
                )}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-amber-900/40 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/40 transition-colors"
            >
              {t("demo.testAccounts", "Test accounts")}
              <span className="material-symbols-outlined text-[14px]">
                {expanded ? "expand_less" : "expand_more"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg p-1 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800/40 transition-colors"
              aria-label={t("common.dismiss", "Dismiss")}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Expanded demo users */}
        {expanded && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {DEMO_USERS.map((user) => (
              <div
                key={user.email}
                className="rounded-xl border border-amber-200 dark:border-amber-700/50 bg-white dark:bg-gray-900/80 p-3 text-xs"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {user.label}
                  </span>
                  <RoleBadge role={user.role} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-gray-500 dark:text-gray-400">Email</span>
                    <div className="flex items-center min-w-0">
                      <span className="truncate text-gray-800 dark:text-gray-200 font-mono text-[10px]">
                        {user.email}
                      </span>
                      <CopyButton value={user.email} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-gray-500 dark:text-gray-400">Password</span>
                    <div className="flex items-center">
                      <span className="font-mono text-[10px] text-gray-800 dark:text-gray-200">
                        {user.password}
                      </span>
                      <CopyButton value={user.password} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
