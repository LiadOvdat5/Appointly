export function SidebarIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={[
        "material-symbols-outlined",
        "text-[22px] leading-none",
        "pointer-events-none select-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
