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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

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
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const handleSelect = (cat: Category) => {
    onChange(cat.id);
    closeDropdown();
  };

  const handleClear = () => {
    onChange("");
    closeDropdown();
  };

  const handleOpenSuggest = () => {
    setMode("suggest");
    setDescription("");
    setSuggestError(null);
    setTimeout(() => descTextareaRef.current?.focus(), 0);
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
        // No existing match — auto-fetch a new name preview from AI
        setMode("chips"); // show loading in chips panel first
        try {
          const preview = await previewCategoryName(description.trim());
          setPreviewName(preview.suggestedName);
          setPreviewIcon(preview.suggestedIcon);
          setMode("preview");
        } catch {
          // Preview failed — fall back to manual request confirmation
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
      await requestNewCategory(description.trim());
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

      {/* ── Search mode ────────────────────────────────────────────── */}
      {open && mode === "search" && (
        <div className="flex flex-col">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MaterialIcon name="search" className="text-[18px]!" />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("onboarding.step2.categorySearchPlaceholder")}
              className={[
                "w-full rounded-t-lg border bg-white py-3 pl-10 pr-3 text-[#111418] outline-none transition",
                "focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white",
                borderCls,
              ].join(" ")}
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
                  onClick={() => handleSelect(cat)}
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
                onClick={handleOpenSuggest}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-primary hover:bg-primary/5 transition"
              >
                <MaterialIcon name="auto_awesome" className="text-[16px]! shrink-0" />
                {t("onboarding.step2.categoryNotFound")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Suggest mode (AI textarea) ─────────────────────────────── */}
      {open && mode === "suggest" && (
        <div className={panelCls}>
          <BackLink onClick={() => setMode("search")} label={t("onboarding.step2.categorySuggestBack")} />
          <p className="text-sm font-semibold text-[#111418] dark:text-white flex items-center gap-2">
            <MaterialIcon name="auto_awesome" className="text-[16px]! text-primary" />
            {t("onboarding.step2.categorySuggestTitle")}
          </p>
          <textarea
            ref={descTextareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("onboarding.step2.categorySuggestPlaceholder")}
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm text-[#111418] dark:text-white outline-none resize-none focus:ring-2 focus:ring-primary transition"
          />
          {suggestError && <p className="text-xs text-danger">{suggestError}</p>}
          <PrimaryButton
            onClick={handleSuggest}
            loading={isLoading}
            disabled={!description.trim()}
            icon="search"
            label={t("onboarding.step2.categorySuggestButton")}
            loadingLabel={t("onboarding.step2.categorySuggestLoading")}
          />
        </div>
      )}

      {/* ── Chips mode (existing category matches) ─────────────────── */}
      {open && mode === "chips" && (
        <div className={panelCls}>
          <BackLink onClick={() => setMode("suggest")} label={t("onboarding.step2.categorySuggestBack")} />
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              {t("onboarding.step2.categorySuggestLoading")}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition"
                >
                  {cat.iconName && <MaterialIcon name={cat.iconName} className="text-[14px]!" />}
                  {cat.name}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMode("preview")}
            className="text-xs text-gray-500 hover:text-primary transition text-left"
          >
            {t("onboarding.step2.categorySuggestNoneMatch")}
          </button>
        </div>
      )}

      {/* ── Preview mode (AI proposes a NEW category name) ─────────── */}
      {open && mode === "preview" && (
        <div className={panelCls}>
          <BackLink onClick={() => setMode("chips")} label={t("onboarding.step2.categorySuggestBack")} />
          <p className="text-sm font-semibold text-[#111418] dark:text-white flex items-center gap-2">
            <MaterialIcon name="auto_awesome" className="text-[16px]! text-primary" />
            {t("onboarding.step2.categoryPreviewTitle")}
          </p>

          {previewName ? (
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              {previewIcon && (
                <MaterialIcon name={previewIcon} className="text-[22px]! text-primary shrink-0" />
              )}
              <div>
                <p className="text-sm font-bold text-primary">{previewName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("onboarding.step2.categoryPreviewSubtext")}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t("onboarding.step2.categoryPreviewFailed")}</p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("onboarding.step2.categoryPreviewBody")}
          </p>

          {requestError && <p className="text-xs text-danger">{requestError}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("search")}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {t("onboarding.step2.categoryPreviewPickManually")}
            </button>
            <PrimaryButton
              className="flex-1"
              onClick={handleConfirmRequest}
              loading={isLoading}
              label={t("onboarding.step2.categoryRequestConfirm")}
              loadingLabel={t("onboarding.step2.categoryRequestLoading")}
            />
          </div>
        </div>
      )}

      {/* ── Request mode (submitting…) ─────────────────────────────── */}
      {open && mode === "request" && (
        <div className={`${panelCls} items-center`}>
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-gray-500">{t("onboarding.step2.categoryRequestLoading")}</p>
        </div>
      )}

      {/* ── Submitted success ──────────────────────────────────────── */}
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

// ── Small helpers ─────────────────────────────────────────────────────────────

function BackLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="text-xs text-gray-500 hover:text-primary transition">
      {label}
    </button>
  );
}

function PrimaryButton({
  onClick,
  loading,
  disabled,
  icon,
  label,
  loadingLabel,
  className = "",
}: {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  icon?: string;
  label: string;
  loadingLabel: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={[
        "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
        "bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {loadingLabel}
        </>
      ) : (
        <>
          {icon && <MaterialIcon name={icon} className="text-[16px]!" />}
          {label}
        </>
      )}
    </button>
  );
}
