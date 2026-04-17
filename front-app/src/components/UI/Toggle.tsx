type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  selectedColor?: string;
};

export function Toggle({ checked, onChange, disabled, selectedColor }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        "disabled:opacity-50",
        checked ? selectedColor || "bg-primary" : "bg-gray-200 dark:bg-gray-700",
      ].join(" ")}
    >
      {/* Use inline style for `left` so it is always the physical CSS `left`
          property — Tailwind v4 maps left-* to inset-inline-start (logical),
          which reverses in RTL and breaks the thumb position. */}
      <span
        style={{ left: checked ? "22px" : "2px", transition: "left 150ms" }}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
      />
    </button>
  );
}
