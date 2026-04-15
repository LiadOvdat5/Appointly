import React from "react";

type Variant = "pending" | "active" | "cancelled" | "rescheduled" | "confirmed";

type Props = {
  variant: Variant;
  children: React.ReactNode;
};

const colorMap: Record<Variant, string> = {
  pending: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  active: "bg-primary/10 text-primary",
  cancelled: "bg-danger/10 text-danger",
  rescheduled: "bg-warning/10 text-warning",
  confirmed: "bg-success/10 text-success",
};

/** Material Symbols icon name per variant — conveys status without relying on color alone */
const iconMap: Record<Variant, string> = {
  pending: "schedule",
  active: "radio_button_checked",
  cancelled: "cancel",
  rescheduled: "event_repeat",
  confirmed: "check_circle",
};

export function Badge({ variant, children }: Props) {
  return (
    <span
      className={["inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg", colorMap[variant]].join(" ")}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "12px" }} aria-hidden="true">
        {iconMap[variant]}
      </span>
      {children}
    </span>
  );
}

export function PillBadge({ variant, children }: Props) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold rounded-full uppercase",
        colorMap[variant],
      ].join(" ")}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "10px" }} aria-hidden="true">
        {iconMap[variant]}
      </span>
      {children}
    </span>
  );
}
