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
  availabilityDate: string | null;
  availabilityTimeFrom: string | null;
  availabilityTimeTo: string | null;
  onAvailabilityDateChange: (date: string | null) => void;
  onAvailabilityTimeChange: (from: string | null, to: string | null) => void;
  onClear?: () => void;
  className?: string;
}

/**
 * SearchHeader Component
 * Sticky header with search input and filter button
 * On small screens the filter button opens a popup with category options.
 * Supports dark mode and responsive design
 */
export function SearchHeader({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  categoryOptions,
  availabilityDate,
  availabilityTimeFrom,
  availabilityTimeTo,
  onAvailabilityDateChange,
  onAvailabilityTimeChange,
  onClear,
  className,
}: SearchHeaderProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);

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
            type="text"
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

      {/* Category filter button / popup */}
      <div className="px-4 py-3">
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          aria-label="Filter categories"
        >
          <MaterialIcon name="filter_list" className="text-[20px]" />
          <span className="text-sm font-medium">Filters</span>
          {availabilityDate && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-white text-xs font-medium">
              {availabilityDate}
            </span>
          )}
        </button>

        {isFilterOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 flex items-start justify-center pt-20"
            onClick={() => setFilterOpen(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-md p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-bold">Filters</h4>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Close filter panel"
                >
                  <MaterialIcon name="close" className="text-[20px]" />
                </button>
              </div>

              {/* Category filter */}
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Categories
              </p>
              <CategoryFilter
                options={categoryOptions}
                selectedCategories={selectedCategories}
                onCategoryChange={onCategoryChange}
                wrap
              />

              {/* Availability date/time filter */}
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Available on
                  </p>
                  {availabilityDate && (
                    <button
                      onClick={() => {
                        onAvailabilityDateChange(null);
                        onAvailabilityTimeChange(null, null);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={availabilityDate ?? ""}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    onAvailabilityDateChange(e.target.value || null)
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {availabilityDate && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Time range (optional)
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={availabilityTimeFrom ?? ""}
                        onChange={(e) =>
                          onAvailabilityTimeChange(
                            e.target.value || null,
                            availabilityTimeTo,
                          )
                        }
                        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-gray-500 text-sm">to</span>
                      <input
                        type="time"
                        value={availabilityTimeTo ?? ""}
                        onChange={(e) =>
                          onAvailabilityTimeChange(
                            availabilityTimeFrom,
                            e.target.value || null,
                          )
                        }
                        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
