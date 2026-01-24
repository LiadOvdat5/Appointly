import React from "react";

type Variant = "primary" | "secondary" | "outline";
type Size = "md" | "sm";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  className,
  children,
  type,
  ...rest
}: Props) {
  const base =
    "w-full rounded-xl font-bold inline-flex items-center justify-center gap-2 " +
    "transition-transform transition-colors duration-150 select-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
    "ring-offset-white dark:ring-offset-background-dark";

  const sizes: Record<Size, string> = {
    md: "py-3 px-4",
    sm: "py-2 px-3 text-sm",
  };

  const variants: Record<Variant, string> = {
    primary:
      "bg-primary text-white hover:brightness-95 active:brightness-90 active:scale-[0.99]",
    secondary:
      "bg-primary/20 text-primary hover:bg-primary/25 active:bg-primary/30 active:scale-[0.99]",
    outline:
      "border border-gray-300 text-[#111418] hover:bg-gray-50 active:bg-gray-100 active:scale-[0.99] " +
      "dark:text-white dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700",
  };

  const disabledCls =
    "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 " +
    "hover:brightness-100 active:scale-100";

  return (
    <button
      type={type ?? "button"} // important: prevent accidental form submit
      className={[
        base,
        sizes[size],
        disabled || isLoading ? disabledCls : variants[variant],
        isLoading ? "opacity-80" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {children}
    </button>
  );
}
