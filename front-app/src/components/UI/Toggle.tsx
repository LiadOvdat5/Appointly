type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  selectedColor?: string;
};

export function Toggle({ checked, onChange, selectedColor }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition",
        checked
          ? selectedColor || "bg-primary"
          : "bg-gray-200 dark:bg-gray-700",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className={[
          "absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white transition",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}
