import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "./MaterialIcon";
import type { Category } from "../../types/search";

type Props = {
  label?: string;
  value: string;
  onChange: (categoryId: string) => void;
  categories: Category[];
  error?: string;
  placeholder?: string;
};

export function CategorySearchSelect({
  label,
  value,
  onChange,
  categories,
  error,
  placeholder,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = categories.find((c) => c.id === value) ?? null;

  const filtered = query.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : categories;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (cat: Category) => {
    onChange(cat.id);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 relative">
      {label && (
        <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
          {label}
        </label>
      )}

      {/* Trigger button (closed state) */}
      {!open && (
        <button
          type="button"
          onClick={handleOpen}
          className={[
            "w-full rounded-lg border bg-white p-3 text-left outline-none transition",
            "focus:ring-2 focus:ring-primary",
            "dark:bg-gray-900 dark:text-white dark:border-gray-700",
            "flex items-center justify-between gap-2",
            error ? "border-danger focus:ring-danger" : "border-gray-300",
          ].join(" ")}
        >
          {selected ? (
            <span className="flex items-center gap-2 text-[#111418] dark:text-white">
              {selected.iconName && (
                <MaterialIcon name={selected.iconName} className="text-[18px]! text-primary" />
              )}
              {selected.name}
            </span>
          ) : (
            <span className="text-gray-400">{placeholder ?? t("onboarding.step2.categoryPlaceholder")}</span>
          )}
          <div className="flex items-center gap-1 shrink-0">
            {selected && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="inline-flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Clear"
              >
                <MaterialIcon name="close" className="text-[16px]!" />
              </button>
            )}
            <MaterialIcon name="expand_more" className="text-[20px]! text-gray-400" />
          </div>
        </button>
      )}

      {/* Open state: search input + dropdown */}
      {open && (
        <div className="flex flex-col">
          {/* Search input */}
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MaterialIcon name="search" className="text-[18px]!" />
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("onboarding.step2.categorySearchPlaceholder")}
              className={[
                "w-full rounded-t-lg border bg-white py-3 pl-10 pr-3 text-[#111418] outline-none transition",
                "focus:ring-2 focus:ring-primary",
                "dark:bg-gray-900 dark:text-white dark:border-gray-700",
                error ? "border-danger" : "border-gray-300",
              ].join(" ")}
            />
          </div>

          {/* Dropdown list */}
          <div className={[
            "max-h-52 overflow-y-auto rounded-b-lg border-x border-b bg-white",
            "dark:bg-gray-900 dark:border-gray-700",
            error ? "border-danger" : "border-gray-300",
          ].join(" ")}>
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-400">
                {t("onboarding.step2.categoryNoResults")}
              </p>
            ) : (
              filtered.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className={[
                    "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition",
                    "hover:bg-gray-50 dark:hover:bg-gray-800",
                    cat.id === value
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-[#111418] dark:text-white",
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

            {/* "Can't find your category?" option */}
            <div className="border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                disabled
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-400 cursor-not-allowed"
                title={t("onboarding.step2.categoryNotFoundComingSoon")}
              >
                <MaterialIcon name="auto_awesome" className="text-[16px]! shrink-0" />
                {t("onboarding.step2.categoryNotFound")}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
