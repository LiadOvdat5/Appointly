import { useState } from "react";
import { useTranslation } from "react-i18next";

const DISMISSED_KEY = "appointly_demo_dismissed";
const PASSWORD = "Demo1234!";

type Role = "owner" | "customer" | "staff";

interface DemoUser {
  name: string;
  email: string;
  business?: string;
}

interface DemoGroup {
  role: Role;
  label: string;
  users: DemoUser[];
}

const DEMO_GROUPS: DemoGroup[] = [
  {
    role: "owner",
    label: "Business Owners",
    users: [
      { name: "Marco Rossi",    email: "marco@demo.com",    business: "Marco's Barbershop" },
      { name: "Isabella Cohen", email: "isabella@demo.com", business: "Bella Nail Studio" },
      { name: "Yasmin Azouri",  email: "yasmin@demo.com",   business: "Glow Facial Spa" },
      { name: "Sophie Levin",   email: "sophie@demo.com",   business: "Coloriste Hair Salon" },
    ],
  },
  {
    role: "customer",
    label: "Customers",
    users: [
      { name: "David Katz",       email: "david@demo.com" },
      { name: "Miriam Goldstein", email: "miriam@demo.com" },
      { name: "Avi Cohen",        email: "avi@demo.com" },
    ],
  },
  {
    role: "staff",
    label: "Staff",
    users: [
      { name: "Dani Ben-David", email: "dani@demo.com",  business: "Marco's Barbershop" },
      { name: "Yossi Stern",    email: "yossi@demo.com", business: "Marco's Barbershop" },
      { name: "Rivka Mizrahi",  email: "rivka@demo.com", business: "Bella Nail Studio" },
      { name: "Tali Shapiro",   email: "tali@demo.com",  business: "Glow Facial Spa" },
      { name: "Hila Peretz",    email: "hila@demo.com",  business: "Glow Facial Spa" },
      { name: "Noa Levi",       email: "noa@demo.com",   business: "Coloriste Hair Salon" },
    ],
  },
];

const ROLE_COLORS: Record<Role, string> = {
  owner:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  customer: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  staff:    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

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
      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
      aria-label={copied ? "Copied" : `Copy ${value}`}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}

export function DemoDisclaimer() {
  const { t, i18n } = useTranslation();
  const isHe = i18n.language.startsWith("he");

  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === "true",
  );
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Role>("owner");

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  const activeGroup = DEMO_GROUPS.find((g) => g.role === activeTab)!;

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
                {t("demo.subtitle", "This is a demo build. Data may be reset at any time.")}
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

        {/* Expanded panel */}
        {expanded && (
          <div className="mt-3">
            {/* Shared password row */}
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-700/50 bg-white dark:bg-gray-900/80 px-3 py-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400 shrink-0">Password (all accounts)</span>
              <span className="font-mono font-semibold text-gray-800 dark:text-gray-200 ml-auto">{PASSWORD}</span>
              <CopyButton value={PASSWORD} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-2">
              {DEMO_GROUPS.map((g) => (
                <button
                  key={g.role}
                  type="button"
                  onClick={() => setActiveTab(g.role)}
                  className={[
                    "flex-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors",
                    activeTab === g.role
                      ? ROLE_COLORS[g.role]
                      : "bg-white dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-amber-200 dark:border-amber-700/50",
                  ].join(" ")}
                >
                  {g.label} ({g.users.length})
                </button>
              ))}
            </div>

            {/* User rows */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-700/50 bg-white dark:bg-gray-900/80 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
              {activeGroup.users.map((user) => (
                <div key={user.email} className="flex items-center gap-3 px-3 py-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</p>
                    {user.business && (
                      <p className="text-[10px] text-gray-400 truncate">{user.business}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono text-[10px] text-gray-600 dark:text-gray-300">{user.email}</span>
                    <CopyButton value={user.email} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
