import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "./MaterialIcon";
import {
  suggestCategories,
  previewCategoryName,
  requestNewCategory,
  UNCATEGORIZED_CATEGORY_ID,
} from "../../services/categoryService";
import type { Category } from "../../types/search";
import { CategorySearchPanel } from "./categorySearch/CategorySearchPanel";
import { CategorySuggestPanel } from "./categorySearch/CategorySuggestPanel";
import { CategoryChipsPanel } from "./categorySearch/CategoryChipsPanel";
import { CategoryPreviewPanel } from "./categorySearch/CategoryPreviewPanel";

// Modes:
// search   → the normal searchable list
// suggest  → AI textarea (owner describes their service)
// chips    → top-3 existing category chips
// preview  → no chips found; AI proposes a brand-new name for review
// request  → owner confirmed the preview; submitting the request
// submitted → success state
type Mode = "search" | "suggest" | "chips" | "preview" | "request" | "submitted";

type Props = {
  label?: string;
  value: string;
  onChange: (categoryId: string) => void;
  categories: Category[];
  error?: string;
  placeholder?: string;
  /** Pass the current businessId so category requests are linked to the right business on approval. */
  businessId?: string;
};

export function CategorySearchSelect({
  label,
  value,
  onChange,
  categories,
  error,
  placeholder,
  businessId,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState<Category[]>([]);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const closeDropdown = () => {
    setOpen(false);
    setMode("search");
    setQuery("");
    setDescription("");
    setSuggestions([]);
    setPreviewName(null);
    setPreviewIcon(null);
    setSuggestError(null);
    setRequestError(null);
  };

  const handleOpen = () => {
    setOpen(true);
    setMode("search");
    setQuery("");
  };

  const handleSelect = (cat: Category) => {
    onChange(cat.id);
    closeDropdown();
  };

  const handleClear = () => {
    onChange("");
    closeDropdown();
  };

  /** Owner submits description → get top-3 chips. If 0, auto-fetch a new name preview. */
  const handleSuggest = async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    setSuggestError(null);
    try {
      const results = await suggestCategories(description.trim());
      setSuggestions(results);

      if (results.length > 0) {
        setMode("chips");
      } else {
        setMode("chips"); // show loading in chips panel first
        try {
          const preview = await previewCategoryName(description.trim());
          setPreviewName(preview.suggestedName);
          setPreviewIcon(preview.suggestedIcon);
          setMode("preview");
        } catch {
          setPreviewName(null);
          setPreviewIcon(null);
          setMode("preview");
        }
      }
    } catch {
      setSuggestError(t("onboarding.step2.categorySuggestError"));
    } finally {
      setIsLoading(false);
    }
  };

  /** Owner confirms the preview → create the request + set Uncategorized */
  const handleConfirmRequest = async () => {
    setIsLoading(true);
    setRequestError(null);
    setMode("request");
    try {
      await requestNewCategory(description.trim(), businessId);
      onChange(UNCATEGORIZED_CATEGORY_ID);
      setMode("submitted");
    } catch {
      setRequestError(t("onboarding.step2.categoryRequestError"));
      setMode("preview");
    } finally {
      setIsLoading(false);
    }
  };

  const borderCls = error ? "border-danger" : "border-gray-300 dark:border-gray-700";
  const panelCls = [
    "flex flex-col gap-3 rounded-lg border bg-white p-4",
    "dark:bg-gray-900",
    borderCls,
  ].join(" ");

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 relative">
      {label && (
        <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
          {label}
        </label>
      )}

      {/* ── Closed trigger ─────────────────────────────────────────── */}
      {!open && (
        <button
          type="button"
          onClick={handleOpen}
          className={[
            "w-full rounded-lg border bg-white p-3 text-left outline-none transition",
            "focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white",
            "flex items-center justify-between gap-2",
            error ? "border-danger focus:ring-danger" : "border-gray-300 dark:border-gray-700",
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

      {open && mode === "search" && (
        <CategorySearchPanel
          query={query}
          onQueryChange={setQuery}
          filtered={filtered}
          value={value}
          borderCls={borderCls}
          onSelect={handleSelect}
          onOpenSuggest={() => {
            setMode("suggest");
            setDescription("");
            setSuggestError(null);
          }}
        />
      )}

      {open && mode === "suggest" && (
        <CategorySuggestPanel
          panelCls={panelCls}
          description={description}
          onDescriptionChange={setDescription}
          suggestError={suggestError}
          isLoading={isLoading}
          onSuggest={handleSuggest}
          onBack={() => setMode("search")}
        />
      )}

      {open && mode === "chips" && (
        <CategoryChipsPanel
          panelCls={panelCls}
          isLoading={isLoading}
          suggestions={suggestions}
          onSelect={handleSelect}
          onBack={() => setMode("suggest")}
          onNoneMatch={() => setMode("preview")}
        />
      )}

      {open && mode === "preview" && (
        <CategoryPreviewPanel
          panelCls={panelCls}
          previewName={previewName}
          previewIcon={previewIcon}
          requestError={requestError}
          isLoading={isLoading}
          onConfirmRequest={handleConfirmRequest}
          onBack={() => setMode("chips")}
          onPickManually={() => setMode("search")}
        />
      )}

      {open && mode === "request" && (
        <div className={`${panelCls} items-center`}>
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-gray-500">{t("onboarding.step2.categoryRequestLoading")}</p>
        </div>
      )}

      {open && mode === "submitted" && (
        <div className={`${panelCls} items-center text-center`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
            <MaterialIcon name="check_circle" className="text-success text-[24px]!" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("onboarding.step2.categoryRequestSuccess")}
          </p>
          <p className="text-xs text-gray-400">{t("onboarding.step2.categoryUncategorizedNote")}</p>
          <button type="button" onClick={closeDropdown} className="text-xs text-primary hover:underline">
            {t("buttons.close")}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
