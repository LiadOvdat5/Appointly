import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "../UI/MaterialIcon";

interface CustomerQuickLinksProps {
  pendingInvitationCount: number;
}

export function CustomerQuickLinks({ pendingInvitationCount }: CustomerQuickLinksProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide mb-4">
        {t("customerDashboard.quickActions")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard/customer")}
          className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
        >
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <MaterialIcon name="event_note" className="text-2xl text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-[#111418] dark:text-white text-sm">
              {t("customerDashboard.myAppointments")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("customerDashboard.myAppointmentsDesc")}
            </p>
          </div>
          <MaterialIcon name="chevron_right" className="text-gray-400 ml-auto shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/search")}
          className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
        >
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <MaterialIcon name="search" className="text-2xl text-green-600" />
          </div>
          <div>
            <p className="font-bold text-[#111418] dark:text-white text-sm">
              {t("customerDashboard.discoverBusinesses")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("customerDashboard.discoverBusinessesDesc")}
            </p>
          </div>
          <MaterialIcon name="chevron_right" className="text-gray-400 ml-auto shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 shadow-sm hover:shadow-md transition text-left"
        >
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <MaterialIcon name="person" className="text-2xl text-orange-600" />
          </div>
          <div>
            <p className="font-bold text-[#111418] dark:text-white text-sm">
              {t("customerDashboard.myProfile")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("customerDashboard.myProfileDesc")}
            </p>
          </div>
          <MaterialIcon name="chevron_right" className="text-gray-400 ml-auto shrink-0" />
        </button>

        {pendingInvitationCount > 0 && (
          <button
            type="button"
            onClick={() => navigate("/invitations")}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition text-left relative"
          >
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 relative">
              <MaterialIcon name="mail" className="text-2xl text-indigo-600" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingInvitationCount}
              </span>
            </div>
            <div>
              <p className="font-bold text-[#111418] dark:text-white text-sm">
                {t("customerDashboard.businessInvitations")}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {t("customerDashboard.pendingInvites_other", {
                  count: pendingInvitationCount,
                })}
              </p>
            </div>
            <MaterialIcon name="chevron_right" className="text-gray-400 ml-auto shrink-0" />
          </button>
        )}
      </div>
    </section>
  );
}
