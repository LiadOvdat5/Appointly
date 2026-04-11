import { Link } from "react-router-dom";
import { MaterialIcon } from "../../UI/MaterialIcon";
import { Card } from "../../UI/Card";

interface AdminReviewStatCardProps {
  label: string;
  value: number | string;
  icon: string;
  iconColor: string;
  iconBg: string;
  loading: boolean;
  linkTo?: string;
  alert?: boolean;
}

export function AdminReviewStatCard({
  label,
  value,
  icon,
  iconColor,
  iconBg,
  loading,
  linkTo,
  alert,
}: AdminReviewStatCardProps) {
  const content = (
    <Card
      className={[
        "flex items-center gap-3 px-4 py-3",
        alert ? "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30" : "",
      ].join(" ")}
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <MaterialIcon name={icon} className={`text-xl ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ) : (
          <p
            className={[
              "font-bold text-lg leading-tight",
              alert ? "text-orange-700 dark:text-orange-300" : "text-[#111418] dark:text-white",
            ].join(" ")}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        )}
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      {linkTo && !loading && (
        <MaterialIcon name="open_in_new" className="text-base text-gray-400 shrink-0" />
      )}
    </Card>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block">{content}</Link>;
  }
  return content;
}
