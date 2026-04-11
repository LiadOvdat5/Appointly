interface MonthlyBarChartProps {
  data: { month: string; count: number }[];
  loading: boolean;
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

export function MonthlyBarChart({ data, loading }: MonthlyBarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="flex items-end gap-1 h-28">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-t bg-gray-200 dark:bg-gray-700"
            style={{ height: `${30 + (i % 5) * 15}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-28">
        {data.map((d) => {
          const heightPct = max > 0 ? (d.count / max) * 100 : 0;
          return (
            <div key={d.month} className="flex-1 relative h-full group">
              <div
                className="absolute bottom-0 left-0 right-0 bg-yellow-400 dark:bg-yellow-500 rounded-t transition-all"
                style={{ height: `${heightPct}%` }}
              >
                {d.count > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
                    {d.count}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1">
        {data.map((d, i) => (
          <div key={d.month} className="flex-1 text-center">
            {i % 2 === 0 ? (
              <span className="text-[9px] text-gray-400 leading-tight">{formatMonth(d.month)}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
