import type { ReactNode } from "react";
import type { ReviewBusinessEntry } from "../../../services/adminService";

interface ReviewRankedListProps {
  title: string;
  items: ReviewBusinessEntry[];
  loading: boolean;
  skeletonCount?: number;
  renderRight: (item: ReviewBusinessEntry) => ReactNode;
  rowVariant?: "default" | "warning";
}

export function ReviewRankedList({
  title,
  items,
  loading,
  skeletonCount,
  renderRight,
  rowVariant,
}: ReviewRankedListProps) {
  const rowBase = "flex items-center gap-3 px-3 py-2 rounded-xl border";
  const rowStyle =
    rowVariant === "warning"
      ? `${rowBase} bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800`
      : `${rowBase} bg-white dark:bg-surface-dark border-[#e7edf3] dark:border-gray-800`;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#111418] dark:text-white">{title}</p>
      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: skeletonCount ?? 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-400 px-1">No data yet.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div key={item.businessId} className={rowStyle}>
              <span className="text-xs font-bold text-gray-400 w-5 text-center shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111418] dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{item.slug}</p>
              </div>
              <div className="shrink-0">{renderRight(item)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
