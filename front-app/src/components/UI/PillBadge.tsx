import React from "react";

type Variant = "blue" | "green" | "purple" | "orange";

type Props = {
  icon: React.ReactNode;
  label: string;
  variant?: Variant;
  className?: string;
};

const variantStyles: Record<Variant, string> = {
  blue: "bg-blue-50 border-blue-100 text-[#0e141b] dark:bg-blue-900/20 dark:border-blue-800",
  green:
    "bg-green-50 border-green-100 text-[#0e141b] dark:bg-green-900/20 dark:border-green-800",
  purple:
    "bg-purple-50 border-purple-100 text-[#0e141b] dark:bg-purple-900/20 dark:border-purple-800",
  orange:
    "bg-orange-50 border-orange-100 text-[#0e141b] dark:bg-orange-900/20 dark:border-orange-800",
};

/**
 * PillBadge - A pill-shaped badge with icon and label
 * Used for feature highlights and tags
 */
export function PillBadge({ icon, label, variant = "blue", className }: Props) {
  return (
    <div
      className={[
        "flex items-center gap-2 px-4 py-2.5 rounded-full shrink-0 border",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}
