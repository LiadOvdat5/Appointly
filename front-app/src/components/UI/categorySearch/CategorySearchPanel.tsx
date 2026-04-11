import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../MaterialIcon";
import type { Category } from "../../../types/search";

interface CategorySearchPanelProps {
  query: string;
  onQueryChange: (q: string) => void;
  filtered: Category[];
  value: string;
  borderCls: string;
  onSelect: (cat: Category) => void;
  onOpenSuggest: () => void;
}

export function CategorySearchPanel({
  query,
  onQueryChange,
  filtered,
  value,
  borderCls,
  onSelect,
  onOpenSuggest,
}: CategorySearchPanelProps) {
  const { t } = useTranslation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <MaterialIcon name="search" className="text-[18px]!" />
        </span>
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("onboarding.step2.categorySearchPlaceholder")}
          className={[
            "w-full rounded-t-lg border bg-white py-3 pl-10 pr-3 text-[#111418] outline-none transition",
            "focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white",
            borderCls,
          ].join(" ")}
          autoFocus
        />
      </div>
      <div className={[
        "max-h-52 overflow-y-auto rounded-b-lg border-x border-b bg-white dark:bg-gray-900",
        borderCls,
      ].join(" ")}>
        {filtered.length === 0 ? (
          <p className="px-3 py-2 text-sm text-gray-400">{t("onboarding.step2.categoryNoResults")}</p>
        ) : (
          filtered.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat)}
              className={[
                "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition",
                "hover:bg-gray-50 dark:hover:bg-gray-800",
                cat.id === value ? "bg-primary/5 text-primary font-medium" : "text-[#111418] dark:text-white",
              ].join(" ")}
            >
              {cat.iconName && (
                <MaterialIcon name={cat.iconName} className="text-[16px]! text-gray-400 shrink-0" />
              )}
              {cat.name}
              {cat.id === value && (
                <MaterialIcon name="check" className="text-[16px]! text-primary ml-auto shrink-0" />
              )}
            </button>
          ))
        )}
        <div className="border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onOpenSuggest}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-primary hover:bg-primary/5 transition"
          >
            <MaterialIcon name="auto_awesome" className="text-[16px]! shrink-0" />
            {t("onboarding.step2.categoryNotFound")}
          </button>
        </div>
      </div>
    </div>
  );
}
