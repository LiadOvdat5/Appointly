import { MaterialIcon } from "../UI/MaterialIcon";
import type { BusinessReportDTO } from "../../services/appointmentService";
import type { MetricDef, TFunc } from "./metricDefs";

interface AnalyticCardProps {
  def: MetricDef;
  report: BusinessReportDTO;
  t: TFunc;
}

export function AnalyticCard({ def, report, t }: AnalyticCardProps) {
  const value = def.getValue(report);
  const subtext = def.getSubtext(report, t);

  return (
    <div className="bg-white dark:bg-surface-dark border border-[#e7edf3] dark:border-gray-800 rounded-2xl shadow-sm px-6 py-5 flex items-center gap-5">
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
          {subtext}
        </p>
      </div>

      <div className="shrink-0 text-right max-w-[45%]">
        <p className={[
          "font-black text-[#0e141b] dark:text-white leading-tight wrap-break-word",
          // Use smaller text for long strings (e.g. service names), large for numbers/short values
          String(value).length > 8 ? "text-base" : String(value).length > 4 ? "text-xl" : "text-3xl",
        ].join(" ")}>
          {value}
        </p>
      </div>
    </div>
  );
}
