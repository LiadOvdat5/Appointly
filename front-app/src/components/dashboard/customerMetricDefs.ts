import type { CustomerReportDTO } from "../../services/appointmentService";
import type { CurrencyCode } from "../../hooks/useCurrency";

export type CustomerMetricKey =
  | "totalBookings"
  | "completedBookings"
  | "canceledBookings"
  | "totalSpent"
  | "favBusiness"
  | "favService";

export type TFunc = (key: string, opts?: Record<string, unknown>) => string;

export interface CurrencyOpts {
  symbol: string;
  code: CurrencyCode;
  convert: (amount: number, from: CurrencyCode, to: CurrencyCode) => number;
}

export interface CustomerMetricDef {
  key: CustomerMetricKey;
  labelKey: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  getValue: (r: CustomerReportDTO, currency?: CurrencyOpts) => string;
  getSubtext: (r: CustomerReportDTO, t: TFunc, currency?: CurrencyOpts) => string;
}

/** Convert totalSpentByCurrency map → single number in the preferred currency */
function computeTotalSpent(r: CustomerReportDTO, currency?: CurrencyOpts): number {
  if (!currency || !r.totalSpentByCurrency || Object.keys(r.totalSpentByCurrency).length === 0) {
    return r.totalSpent;
  }
  return Object.entries(r.totalSpentByCurrency).reduce((sum, [from, amount]) => {
    return sum + currency.convert(amount, from as CurrencyCode, currency.code);
  }, 0);
}

export const CUSTOMER_METRIC_DEFS: CustomerMetricDef[] = [
  {
    key: "totalBookings",
    labelKey: "customerDashboard.metrics.totalBookings",
    icon: "event_available",
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    getValue: (r) => String(r.totalBookings),
    getSubtext: (r, t) =>
      r.totalBookings === 1
        ? t("customerDashboard.metrics.appointment")
        : t("customerDashboard.metrics.appointments"),
  },
  {
    key: "completedBookings",
    labelKey: "customerDashboard.metrics.completed",
    icon: "check_circle",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    getValue: (r) => String(r.completedBookings),
    getSubtext: (r, t) =>
      r.totalBookings > 0
        ? `${Math.round((r.completedBookings / (r.totalBookings + r.canceledBookings)) * 100)}% completion rate`
        : t("customerDashboard.metrics.noAppointments"),
  },
  {
    key: "canceledBookings",
    labelKey: "customerDashboard.metrics.cancellations",
    icon: "event_busy",
    iconColor: "text-red-500",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    getValue: (r) => String(r.canceledBookings),
    getSubtext: (r, t) => {
      const total = r.totalBookings + r.canceledBookings;
      if (total === 0) return t("customerDashboard.metrics.noAppointments");
      return `${Math.round((r.canceledBookings / total) * 100)}% cancellation rate`;
    },
  },
  {
    key: "totalSpent",
    labelKey: "customerDashboard.metrics.totalSpent",
    icon: "payments",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    getValue: (r, currency) => {
      const sym = currency?.symbol ?? "$";
      const total = computeTotalSpent(r, currency);
      return `${sym}${total.toFixed(2)}`;
    },
    getSubtext: (r, t, currency) => {
      const sym = currency?.symbol ?? "$";
      const total = computeTotalSpent(r, currency);
      return r.totalBookings > 0
        ? `${sym}${(total / r.totalBookings).toFixed(2)} avg per visit`
        : t("customerDashboard.metrics.noDataYet");
    },
  },
  {
    key: "favBusiness",
    labelKey: "customerDashboard.metrics.favBusiness",
    icon: "star",
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    getValue: (r) => r.favoriteBusinessName ?? "—",
    getSubtext: (r, t) =>
      r.favoriteBusinessCount > 0
        ? `${r.favoriteBusinessCount} visit${r.favoriteBusinessCount !== 1 ? "s" : ""}`
        : t("customerDashboard.metrics.noDataYet"),
  },
  {
    key: "favService",
    labelKey: "customerDashboard.metrics.favService",
    icon: "content_cut",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    getValue: (r) => r.favoriteServiceName ?? "—",
    getSubtext: (r, t) =>
      r.favoriteServiceCount > 0
        ? `Booked ${r.favoriteServiceCount} time${r.favoriteServiceCount !== 1 ? "s" : ""}`
        : t("customerDashboard.metrics.noDataYet"),
  },
];

export const DEFAULT_CUSTOMER_METRICS: CustomerMetricKey[] = [
  "totalBookings",
  "totalSpent",
  "favBusiness",
];
