import React from "react";
import { MaterialIcon } from "./MaterialIcon";

export type AlertVariant = "error" | "warning" | "success" | "info";

type Props = {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const styles: Record<
  AlertVariant,
  {
    container: string;
    icon: string;
    iconName: string;
    title: string;
    text: string;
  }
> = {
  error: {
    container: "bg-danger/10 border border-danger/20",
    icon: "text-danger",
    iconName: "error",
    title: "text-danger",
    text: "text-danger/90",
  },
  warning: {
    container: "bg-warning/10 border border-warning/20",
    icon: "text-warning",
    iconName: "warning",
    title: "text-warning",
    text: "text-warning/90",
  },
  success: {
    container: "bg-success/10 border border-success/20",
    icon: "text-success",
    iconName: "check_circle",
    title: "text-success",
    text: "text-success/90",
  },
  info: {
    container: "bg-primary/10 border border-primary/20",
    icon: "text-primary",
    iconName: "info",
    title: "text-primary",
    text: "text-primary/90",
  },
};

export function Alert({ variant, title, children, className }: Props) {
  const s = styles[variant];

  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-3 rounded-lg p-3",
        s.container,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <MaterialIcon name={s.iconName} className={`mt-[2px] ${s.icon}`} />

      <div className="flex flex-col gap-0.5">
        {title && <p className={`text-sm font-semibold ${s.title}`}>{title}</p>}

        <p className={`text-sm leading-relaxed ${s.text}`}>{children}</p>
      </div>
    </div>
  );
}
