import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "../UI/Card";
import { Button } from "../UI/Button";
import { MaterialIcon } from "../UI/MaterialIcon";
import type { BusinessProfile } from "../../types/business";

interface CustomerFollowedSectionProps {
  businesses: BusinessProfile[];
  loading: boolean;
  unfollowingId: string | null;
  onUnfollow: (id: string) => void;
}

export function CustomerFollowedSection({
  businesses,
  loading,
  unfollowingId,
  onUnfollow,
}: CustomerFollowedSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#111418] dark:text-white text-sm uppercase tracking-wide">
          {t("customerDashboard.followedBusinesses")}
        </h2>
        {businesses.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/search")}
            className="text-xs text-primary font-semibold flex items-center gap-1 group"
          >
            <span className="group-hover:underline">{t("customerDashboard.discoverMore")}</span>
            <MaterialIcon name="chevron_right" className="text-sm" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-8 flex flex-col items-center gap-3 text-center">
          <MaterialIcon
            name="favorite_border"
            className="text-4xl text-gray-300 dark:text-gray-600"
          />
          <div>
            <p className="font-semibold text-sm text-[#111418] dark:text-white">
              {t("customerDashboard.noFollowed.title")}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {t("customerDashboard.noFollowed.text")}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/search")}>
            {t("customerDashboard.exploreBusinesses")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {businesses.map((biz) => (
            <Card key={biz.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {biz.logoUrl ? (
                    <img
                      src={biz.logoUrl}
                      alt={biz.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MaterialIcon name="storefront" className="text-xl text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/business/${biz.slug ?? biz.id}`)}
                    className="font-semibold text-sm text-[#111418] dark:text-white hover:text-primary transition-colors truncate block text-left"
                  >
                    {biz.name}
                  </button>
                  {biz.categories && biz.categories.length > 0 && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {biz.categories.map((c) => c.name).join(" · ")}
                    </p>
                  )}
                  {biz.address && (
                    <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                      <MaterialIcon name="location_on" className="text-xs leading-none" />
                      {biz.address}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/business/${biz.slug ?? biz.id}`)}
                  >
                    Book
                  </Button>
                  <button
                    type="button"
                    onClick={() => onUnfollow(biz.id)}
                    disabled={unfollowingId === biz.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    aria-label="Unfollow"
                  >
                    {unfollowingId === biz.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 block" />
                    ) : (
                      <MaterialIcon
                        name="favorite"
                        className="text-base leading-none text-primary icon-filled"
                      />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
