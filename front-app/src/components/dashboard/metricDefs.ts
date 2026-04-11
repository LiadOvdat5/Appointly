import type { BusinessReportDTO } from "../../services/appointmentService";

export type MetricKey =
  | "bookings"
  | "revenue"
  | "topService"
  | "cancellations"
  | "avgValue"
  | "uniqueCustomers"
  | "busiestDay";

export type TFunc = (key: string, opts?: Record<string, unknown>) => string;

export interface MetricDef {
  key: MetricKey;
  labelKey: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  getValue: (r: BusinessReportDTO) => string;
  getSubtext: (r: BusinessReportDTO, t: TFunc) => string;
}

export const METRIC_DEFS: MetricDef[] = [
  {
    key: "bookings",
    labelKey: "dashboard.metrics.totalBookings",
    icon: "event_available",
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    getValue: (r) => String(r.totalAppointments),
    getSubtext: (r, t) =>
      r.totalAppointments === 1
        ? t("dashboard.metrics.appointment")
        : t("dashboard.metrics.appointments"),
  },
  {
    key: "revenue",
    labelKey: "dashboard.metrics.revenue",
    icon: "payments",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    getValue: (r) => `$${r.revenue.toFixed(2)}`,
    getSubtext: (_r, t) => t("dashboard.metrics.revenueSubtext"),
  },
  {
    key: "topService",
    labelKey: "dashboard.metrics.topService",
    icon: "star",
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    getValue: (r) => r.topServiceName ?? "—",
    getSubtext: (r, t) =>
      r.topServiceCount > 0
        ? `${r.topServiceCount} ${t("dashboard.metrics.bookings")}`
        : t("dashboard.metrics.noDataYet"),
  },
  {
    key: "cancellations",
    labelKey: "dashboard.metrics.cancellations",
    icon: "event_busy",
    iconColor: "text-red-500",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    getValue: (r) => String(r.cancellations),
    getSubtext: (r, t) => {
      const total = r.totalAppointments + r.cancellations;
      if (total === 0) return t("dashboard.metrics.noAppointments");
      const rate = Math.round((r.cancellations / total) * 100);
      return t("dashboard.metrics.cancellationRate", { rate });
    },
  },
  {
    key: "avgValue",
    labelKey: "dashboard.metrics.avgValue",
    icon: "trending_up",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    getValue: (r) =>
      r.totalAppointments > 0
        ? `$${(r.revenue / r.totalAppointments).toFixed(2)}`
        : "—",
    getSubtext: (_r, t) => t("dashboard.metrics.revenuePerAppt"),
  },
  {
    key: "uniqueCustomers",
    labelKey: "dashboard.metrics.uniqueCustomers",
    icon: "group",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    getValue: (r) => String(r.uniqueCustomers),
    getSubtext: (r, t) =>
      r.uniqueCustomers === 1
        ? t("dashboard.metrics.individualClient")
        : t("dashboard.metrics.individualClients"),
  },
  {
    key: "busiestDay",
    labelKey: "dashboard.metrics.busiestDay",
    icon: "bar_chart",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    getValue: (r) => r.busiestDayOfWeek ?? "—",
    getSubtext: (_r, t) => t("dashboard.metrics.mostBookingsDay"),
  },
];

export const DEFAULT_METRICS: MetricKey[] = ["bookings", "revenue", "topService"];
