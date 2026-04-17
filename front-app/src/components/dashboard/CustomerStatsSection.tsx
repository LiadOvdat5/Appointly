import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../UI/MaterialIcon";
import { CUSTOMER_METRIC_DEFS, type CustomerMetricKey } from "./customerMetricDefs";
import type { CustomerReportDTO } from "../../services/appointmentService";

interface CustomerStatsSectionProps {
  report: CustomerReportDTO | null;
  reportLoading: boolean;
  activeMetrics: CustomerMetricKey[];
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onToggleMetric: (key: CustomerMetricKey) => void;
}

export function CustomerStatsSection({
  report,
  reportLoading,
  activeMetrics,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onToggleMetric,
}: CustomerStatsSectionProps) {
  const { t } = useTranslation();

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide">
          {t("customerDashboard.myActivity")}
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MaterialIcon name="date_range" className="text-base" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-surface-dark text-[#111418] dark:text-white text-xs"
          />
          <span>–</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-surface-dark text-[#111418] dark:text-white text-xs"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {CUSTOMER_METRIC_DEFS.map((def) => {
          const active = activeMetrics.includes(def.key);
          return (
            <button
              key={def.key}
              type="button"
              onClick={() => onToggleMetric(def.key)}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                active
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary",
              ].join(" ")}
            >
              <MaterialIcon name={def.icon} className="text-sm leading-none" />
              {t(def.labelKey)}
            </button>
          );
        })}
      </div>

      {reportLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : activeMetrics.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <MaterialIcon
            name="insights"
            className="text-4xl text-gray-300 dark:text-gray-700"
          />
          <p className="text-sm text-gray-400">
            {t("customerDashboard.selectMetrics")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {CUSTOMER_METRIC_DEFS.filter((d) => activeMetrics.includes(d.key)).map(
            (def) =>
              report ? (
                <div
                  key={def.key}
                  className="bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 rounded-2xl shadow-sm px-6 py-5 flex items-center gap-5"
                >
                  <div
                    className={[
                      "h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center",
                      def.iconBg,
                    ].join(" ")}
                  >
                    <MaterialIcon
                      name={def.icon}
                      className={["text-2xl", def.iconColor].join(" ")}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {t(def.labelKey)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {def.getSubtext(report, t)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right max-w-[45%]">
                    <p className={[
                      "font-black text-[#0e141b] dark:text-white leading-tight wrap-break-word",
                      String(def.getValue(report)).length > 8 ? "text-base" : String(def.getValue(report)).length > 4 ? "text-xl" : "text-3xl",
                    ].join(" ")}>
                      {def.getValue(report)}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  key={def.key}
                  className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center"
                >
                  <span className="text-xs text-gray-400">
                    {t("customerDashboard.noDataPeriod")}
                  </span>
                </div>
              ),
          )}
        </div>
      )}
    </section>
  );
}
