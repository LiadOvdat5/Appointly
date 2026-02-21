import { useState } from "react";
import { MaterialIcon } from "../UI/MaterialIcon";
import { CategoryFilter } from "./CategoryFilter";
import type { CategoryFilterOption } from "./CategoryFilter";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: string[];
  onCategoryChange: (categoryId: string) => void;
  categoryOptions: CategoryFilterOption[];
  onClear?: () => void;
  className?: string;
}

/**
 * SearchHeader Component
 * Sticky header with search input and category filter chips
 * Supports dark mode and responsive design
 */
export function SearchHeader({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  categoryOptions,
  onClear,
  className,
}: SearchHeaderProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange("");
    onClear?.();
  };

  return (
    <header
      className={[
        "sticky top-0 z-30 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md",
        "border-b border-gray-200 dark:border-gray-800 shadow-sm",
        "transition-all duration-300",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Search Input Section */}
      <div className="px-4 pt-4 pb-2">
        <div
          className={[
            "flex w-full items-stretch rounded-lg h-12 bg-white dark:bg-gray-800",
            "border shadow-sm transition-all",
            isFocused
              ? "border-primary ring-2 ring-primary/20"
              : "border-gray-200 dark:border-gray-700",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Search Icon */}
          <div className="flex items-center justify-center pl-4 pr-2 text-gray-400 dark:text-gray-500">
            <MaterialIcon name="search" className="text-[24px]" />
          </div>

          {/* Search Input */}
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for salons, doctors..."
            className={[
              "flex-1 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400",
              "focus:outline-none border-none px-0 text-base font-normal leading-normal",
            ]
              .filter(Boolean)
              .join(" ")}
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={handleClear}
              className={[
                "flex items-center justify-center pr-4 text-gray-400 dark:text-gray-500",
                "hover:text-gray-600 dark:hover:text-gray-400 transition-colors",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label="Clear search"
            >
              <MaterialIcon name="close" className="text-[20px]" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="px-4 py-3">
        <CategoryFilter
          options={categoryOptions}
          selectedCategories={selectedCategories}
          onCategoryChange={onCategoryChange}
        />
      </div>
    </header>
  );
}
