import React from "react";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  className?: string;
};

/**
 * FeatureCard - A card component for displaying features
 * Shows icon with colored background, title, and description
 */
export function FeatureCard({
  icon,
  title,
  description,
  iconBgColor = "bg-blue-50 text-[#1980e6]",
  className,
}: Props) {
  return (
    <div
      className={[
        "flex gap-4 p-4 bg-white dark:bg-gray-900",
        "rounded-2xl border border-[#e7edf3] dark:border-gray-800 items-start",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          iconBgColor,
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="text-[#0e141b] dark:text-white text-lg font-bold">
          {title}
        </h3>
        <p className="text-[#4e7397] dark:text-gray-400 text-sm leading-normal">
          {description}
        </p>
      </div>
    </div>
  );
}
