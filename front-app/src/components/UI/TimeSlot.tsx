type TimeSlotProps = {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

export function TimeSlot({
  selected,
  disabled,
  onClick,
  children,
  className,
}: TimeSlotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "min-h-11 py-2 rounded-lg font-medium text-sm border text-center transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "ring-offset-white dark:ring-offset-background-dark",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        selected
          ? "border-primary text-primary bg-primary/5"
          : "border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
