import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../UI/MaterialIcon";
import { AnalyticCard } from "./AnalyticCard";
import { METRIC_DEFS, type MetricKey } from "./metricDefs";
import type { BusinessReportDTO } from "../../services/appointmentService";

interface DashboardStatsSectionProps {
  report: BusinessReportDTO | null;
  reportLoading: boolean;
  activeMetrics: MetricKey[];
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onToggleMetric: (key: MetricKey) => void;
}

export function DashboardStatsSection({
  report,
  reportLoading,
  activeMetrics,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onToggleMetric,
}: DashboardStatsSectionProps) {
  const { t } = useTranslation();

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide">
          {t("dashboard.performance")}
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
        {METRIC_DEFS.map((def) => {
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
          <p className="text-sm text-gray-400">{t("dashboard.selectMetrics")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {METRIC_DEFS.filter((d) => activeMetrics.includes(d.key)).map((def) =>
            report ? (
              <AnalyticCard key={def.key} def={def} report={report} t={t} />
            ) : (
              <div
                key={def.key}
                className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center"
              >
                <span className="text-xs text-gray-400">
                  {t("dashboard.noData")}
                </span>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}
