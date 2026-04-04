// src/components/ui/Input.tsx
import React, { useId, useMemo, useState } from "react";
import { MaterialIcon } from "./MaterialIcon";

export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "search"
  | "url"
  | "date"
  | "time"
  | "datetime-local";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  label?: string;
  hint?: string;
  error?: string;

  type?: InputType;

  /** Controlled value */
  value?: string;
  /** Uncontrolled value */
  defaultValue?: string;

  /** Simplified change handler */
  onValueChange?: (value: string) => void;

  /** Optional icons (rendered inside the input) */
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;

  /** Show clear button (useful for search/text) */
  clearable?: boolean;

  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

export function Input({
  id,
  label,
  hint,
  error,

  type = "text",

  value,
  defaultValue,
  onValueChange,

  startIcon,
  endIcon,

  clearable,

  disabled,
  className,
  placeholder,
  name,
  autoComplete,

  onChange, // still allow native onChange
  ...rest
}: InputProps) {
  const reactId = useId();
  const inputId = id ?? `input-${reactId}`;

  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const currentValue = isControlled ? value! : internalValue;

  const [showPassword, setShowPassword] = useState(false);
  const actualType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  const hasStart = Boolean(startIcon);
  const hasPasswordToggle = type === "password";
  const hasClear =
    Boolean(clearable) &&
    !disabled &&
    (type === "text" ||
      type === "search" ||
      type === "email" ||
      type === "url" ||
      type === "tel") &&
    (currentValue?.length ?? 0) > 0;

  const rightSlotCount = useMemo(() => {
    let c = 0;
    if (hasClear) c += 1;
    if (hasPasswordToggle) c += 1;
    if (endIcon && !hasPasswordToggle) c += 1;
    return c;
  }, [hasClear, hasPasswordToggle, endIcon]);

  const prClass =
    rightSlotCount === 0
      ? ""
      : rightSlotCount === 1
        ? "ltr:pr-10 rtl:pl-10"
        : rightSlotCount === 2
          ? "ltr:pr-16 rtl:pl-16"
          : "ltr:pr-20 rtl:pl-20";

  const plClass = hasStart ? "ltr:pl-10 rtl:pr-10" : "";

  const baseInput =
    "w-full rounded-lg border bg-white p-3 text-[#111418] outline-none transition " +
    "focus:ring-2 focus:ring-primary " +
    "dark:bg-gray-900 dark:text-white dark:border-gray-700";

  const errorCls = error
    ? "border-danger focus:ring-danger"
    : "border-gray-300";

  const disabledCls = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-text";

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(e);
    const next = e.target.value;

    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const clear = () => {
    if (disabled) return;
    if (!isControlled) setInternalValue("");
    onValueChange?.("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-[#111418] dark:text-gray-200"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {hasStart && (
          <span className="pointer-events-none absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {startIcon}
          </span>
        )}

        <input
          id={inputId}
          name={name}
          type={actualType}
          value={isControlled ? value : undefined}
          defaultValue={!isControlled ? defaultValue : undefined}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={[
            baseInput,
            errorCls,
            disabledCls,
            plClass,
            prClass,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />

        {/* End-side controls (clear, password toggle, end icon) */}
        <div className="absolute ltr:right-2 rtl:left-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {hasClear && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              aria-label="Clear"
              tabIndex={-1}
            >
              <MaterialIcon name="close" className="!text-[18px]" />
            </button>
          )}

          {hasPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              <MaterialIcon
                name={showPassword ? "visibility_off" : "visibility"}
                className="!text-[18px]"
              />
            </button>
          )}

          {endIcon && !hasPasswordToggle && (
            <span className="pointer-events-none inline-flex h-8 w-8 items-center justify-center text-gray-400">
              {endIcon}
            </span>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}
