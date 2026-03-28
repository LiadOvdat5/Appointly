import React from "react";

type Props = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  className?: string;
};

/**
 * StatCard - A card component for displaying statistics/metrics
 */
export function StatCard({
  label,
  value,
  description,
  icon,
  iconBgColor = "bg-green-100",
  className,
}: Props) {
  return (
    <div
      className={[
        "bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm",
        "border border-[#e7edf3] dark:border-gray-800",
        "flex items-center justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[#4e7397] dark:text-gray-400 text-sm font-medium uppercase tracking-wide">
          {label}
        </span>
        <span className="text-[#0e141b] dark:text-white text-2xl font-black mt-1 truncate">
          {value}
        </span>
        <p className="text-[#4e7397] dark:text-gray-400 text-sm mt-1">
          {description}
        </p>
      </div>
      <div className={["h-12 w-12 shrink-0 rounded-full flex items-center justify-center", iconBgColor].join(" ")}>{icon}</div>
    </div>
  );
}
