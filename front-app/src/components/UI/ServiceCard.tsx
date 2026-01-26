import React from "react";

type Props = {
  image: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
};

/**
 * ServiceCard - A card component with image overlay for service categories
 */
export function ServiceCard({
  image,
  title,
  subtitle,
  onClick,
  className,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={[
        "group relative aspect-[4/5] rounded-3xl overflow-hidden bg-slate-200",
        "transition-transform active:scale-95",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url("${image}")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 text-left">
        <p className="text-white text-sm font-bold">{title}</p>
        {subtitle && <p className="text-white/70 text-[10px]">{subtitle}</p>}
      </div>
    </button>
  );
}
