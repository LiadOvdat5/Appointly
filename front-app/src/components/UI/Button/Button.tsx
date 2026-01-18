import React from "react";

export type ButtonProps = {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  color?: string; // Tailwind color classes, e.g. 'bg-blue-500 text-white'
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: string;
  buttonType?: "button" | "submit" | "reset";
};

const variantMap = {
  primary: "bg-black text-white hover:bg-gray-900 font-bold",
  secondary: "bg-gray-200 text-black hover:bg-gray-300 font-bold",
  outline:
    "bg-transparent text-black border hover:bg-black hover:text-white font-bold",
};

const sizeMap = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const spinner = (
  <svg className="animate-spin h-4 w-4 mr-2 text-current" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  color = "",
  disabled = false,
  icon,
  fullWidth = false,
  loading = false,
  children,
  onClick,
  style: className = "",
  buttonType = "button",
}) => {
  const base =
    "inline-flex items-center justify-center rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-black";
  const width = fullWidth ? "w-full" : "";
  const classes = [
    base,
    variantMap[variant],
    sizeMap[size],
    color,
    width,
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ]
    .join(" ")
    .trim();

  return (
    <button
      type={buttonType}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && spinner}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
