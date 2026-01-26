import React from "react";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonVariant?: "primary" | "dark";
  onClick?: () => void;
  className?: string;
};

/**
 * SelectionCard - A card component for user type selection
 * Features icon, title, description, and CTA button
 */
export function SelectionCard({
  icon,
  title,
  description,
  buttonLabel,
  buttonVariant = "primary",
  onClick,
  className,
}: Props) {
  const buttonStyles =
    buttonVariant === "primary"
      ? "bg-[#1980e6] text-white shadow-blue-200"
      : "bg-[#0e141b] text-white shadow-slate-300";

  return (
    <div
      className={[
        "bg-white rounded-2xl p-6 shadow-sm border border-slate-100",
        "flex flex-col gap-4 transition-all active:scale-[0.98]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between">
        <div>{icon}</div>
      </div>
      <div>
        <h3 className="text-[#0e141b] dark:text-white text-xl font-bold">
          {title}
        </h3>
        <p className="text-[#4e7397] dark:text-gray-400 text-sm mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      <button
        onClick={onClick}
        className={[
          "w-full font-bold py-3.5 rounded-xl shadow-md mt-2",
          "transition-all hover:brightness-95 active:brightness-90",
          buttonStyles,
        ].join(" ")}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
