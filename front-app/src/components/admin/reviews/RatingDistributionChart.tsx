import { MaterialIcon } from "../../UI/MaterialIcon";

interface RatingDistributionChartProps {
  distribution: Record<string, number>;
  total: number;
  loading: boolean;
}

const STAR_COLORS = ["bg-green-500", "bg-lime-500", "bg-yellow-400", "bg-orange-400", "bg-red-500"];

export function RatingDistributionChart({ distribution, total, loading }: RatingDistributionChartProps) {
  const stars = [5, 4, 3, 2, 1];
  const max = Math.max(...stars.map((s) => distribution[String(s)] ?? 0), 1);

  if (loading) {
    return (
      <div className="space-y-2">
        {stars.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4 text-right">{s}</span>
            <MaterialIcon name="star" className="text-xs text-gray-300" />
            <div className="flex-1 h-5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stars.map((s, idx) => {
        const count = distribution[String(s)] ?? 0;
        const widthPct = max > 0 ? (count / max) * 100 : 0;
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
        return (
          <div key={s} className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-3 text-right">{s}</span>
            <MaterialIcon name="star" className="text-xs text-yellow-400" />
            <div className="flex-1 relative h-5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${STAR_COLORS[idx]}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-14 text-right shrink-0">
              {count.toLocaleString()} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}
