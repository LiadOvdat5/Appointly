type ChipProps = {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

export function Chip({
  selected,
  disabled,
  onClick,
  children,
  className,
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-4 py-1.5 text-sm font-medium rounded-full transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "ring-offset-white dark:ring-offset-background-dark",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        selected
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
