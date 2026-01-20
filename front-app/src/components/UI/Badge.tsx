type Variant = "pending" | "active" | "cancelled" | "rescheduled" | "confirmed";

type Props = {
  variant: Variant;
  children: React.ReactNode;
};

const map: Record<Variant, string> = {
  pending: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  active: "bg-primary/10 text-primary",
  cancelled: "bg-danger/10 text-danger",
  rescheduled: "bg-warning/10 text-warning",
  confirmed: "bg-success/10 text-success",
};

export function Badge({ variant, children }: Props) {
  return (
    <span
      className={["px-3 py-1 text-xs font-bold rounded-lg", map[variant]].join(
        " ",
      )}
    >
      {children}
    </span>
  );
}

export function PillBadge({ variant, children }: Props) {
  return (
    <span
      className={[
        "px-3 py-1 text-[10px] font-bold rounded-full uppercase",
        map[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
