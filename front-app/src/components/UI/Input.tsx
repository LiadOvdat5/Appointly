import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
          {label}
        </label>
      )}
      <input
        className={[
          "w-full rounded-lg border border-gray-300 bg-white p-3 text-[#111418] outline-none focus:ring-2 focus:ring-primary",
          "dark:border-gray-700 dark:bg-gray-900 dark:text-white",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
    </div>
  );
}
