import React from "react";

type Option = { value: string; label: string };

type Props = {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: Option[];
  className?: string;
  disabled?: boolean;
  name?: string;
};

export function Select({
  label,
  value,
  defaultValue,
  onChange,
  options,
  className,
  disabled,
  name,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
          {label}
        </label>
      )}

      <select
        name={name}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        className={[
          "w-full rounded-lg border border-gray-300 bg-white p-3 text-[#111418] outline-none",
          "focus:ring-2 focus:ring-primary",
          "dark:border-gray-700 dark:bg-gray-900 dark:text-white",
          "cursor-pointer",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
