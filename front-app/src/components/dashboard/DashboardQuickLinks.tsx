import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "../UI/MaterialIcon";

interface DashboardQuickLinksProps {
  businessSlug: string;
  reviewCount: number | undefined;
  averageRating: number | undefined;
  followerCount: number | null;
}

export function DashboardQuickLinks({
  businessSlug,
  reviewCount,
  averageRating,
  followerCount,
}: DashboardQuickLinksProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const links = [
    {
      label: t("dashboard.servicesHours"),
      desc: t("dashboard.servicesHoursDesc"),
      icon: "tune",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate(`/dashboard/${businessSlug}/services`),
    },
    {
      label: t("dashboard.viewPublicPage"),
      desc: t("dashboard.viewPublicPageDesc"),
      icon: "storefront",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => navigate(`/business/${businessSlug}`),
    },
    {
      label: t("dashboard.editBusinessPage"),
      desc: t("dashboard.editBusinessPageDesc"),
      icon: "edit_note",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => navigate(`/business/${businessSlug}?edit=true`),
    },
    {
      label: t("dashboard.staffManagement"),
      desc: t("dashboard.staffManagementDesc"),
      icon: "group",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      onClick: () => navigate(`/dashboard/${businessSlug}/staff`),
    },
    {
      label: t("dashboard.reviews"),
      desc:
        (reviewCount ?? 0) > 0
          ? `${t("dashboard.reviewCount", { count: reviewCount })} · ${averageRating?.toFixed(1)} ${t("dashboard.avgSuffix")}`
          : t("dashboard.noReviewsYet"),
      icon: "star",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-500",
      onClick: () => navigate(`/dashboard/${businessSlug}/reviews`),
    },
    {
      label: t("dashboard.notificationSettings"),
      desc: t("dashboard.notificationSettingsSubtext"),
      icon: "notifications",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-500",
      onClick: () => navigate(`/dashboard/${businessSlug}/notifications`),
    },
    {
      label: t("dashboard.messageFollowers"),
      desc:
        followerCount === null || followerCount === 0
          ? t("dashboard.messageFollowersDescNone")
          : t("dashboard.messageFollowersDesc", { count: followerCount }),
      icon: "campaign",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
      onClick: () => navigate(`/dashboard/${businessSlug}/broadcasts`),
    },
  ];

  return (
    <section>
      <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
        {t("dashboard.manage")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((link) => (
          <button
            key={link.label}
            type="button"
            onClick={link.onClick}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
          >
            <div
              className={`h-12 w-12 rounded-full ${link.iconBg} flex items-center justify-center shrink-0`}
            >
              <MaterialIcon
                name={link.icon}
                className={`text-2xl ${link.iconColor}`}
              />
            </div>
            <div>
              <p className="font-bold text-[#111418] dark:text-white text-sm">
                {link.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
            </div>
            <MaterialIcon
              name="chevron_right"
              className="text-gray-400 ml-auto shrink-0"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
