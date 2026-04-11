import { useTranslation } from "react-i18next";
import type { ServiceProfile } from "../../types/business";
import { Card } from "../UI/Card";
import { MaterialIcon } from "../UI/MaterialIcon";

interface ReviewFiltersCardProps {
  services: ServiceProfile[];
  filterService: string;
  filterRating: number;
  filterFrom: string;
  filterTo: string;
  hasActiveFilters: boolean;
  onServiceChange: (val: string) => void;
  onRatingChange: (val: number) => void;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  onClear: () => void;
}

export function ReviewFiltersCard({
  services,
  filterService,
  filterRating,
  filterFrom,
  filterTo,
  hasActiveFilters,
  onServiceChange,
  onRatingChange,
  onFromChange,
  onToChange,
  onClear,
}: ReviewFiltersCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <MaterialIcon name="filter_list" className="text-base text-gray-500" />
        <span className="text-sm font-semibold text-[#111418] dark:text-white">
          {t("reviews.filters.title")}
        </span>
        {hasActiveFilters && (
          <button type="button" onClick={onClear} className="ml-auto text-xs text-primary hover:underline">
            {t("reviews.filters.clearAll")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Service filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {t("reviews.filters.service")}
          </label>
          <select
            value={filterService}
            onChange={(e) => onServiceChange(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">{t("reviews.filters.allServices")}</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Rating filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {t("reviews.filters.rating")}
          </label>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRatingChange(r)}
                className={[
                  "flex-1 rounded-lg border text-xs font-semibold py-2 transition-all",
                  filterRating === r
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {r === 0 ? t("reviews.filters.all") : `${r}★`}
              </button>
            ))}
          </div>
        </div>

        {/* Date from */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {t("reviews.filters.from")}
          </label>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => onFromChange(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {t("reviews.filters.to")}
          </label>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => onToChange(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </Card>
  );
}
