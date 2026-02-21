import { MaterialIcon } from "../UI/MaterialIcon";

export interface CategoryFilterOption {
  id: string;
  label: string;
  icon: string;
}

interface CategoryFilterProps {
  options: CategoryFilterOption[];
  selectedCategories: string[];
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

/**
 * CategoryFilter Component
 * Reusable chip-based category filter with Material Icons
 * Displays categories in a horizontal scrollable layout
 */
export function CategoryFilter({
  options,
  selectedCategories,
  onCategoryChange,
  className,
}: CategoryFilterProps) {
  const isSelected = (categoryId: string) =>
    selectedCategories.includes(categoryId);

  return (
    <div
      className={[
        "flex gap-3 overflow-x-auto pb-2 scroll-smooth",
        // Hide scrollbar but keep functionality
        "scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onCategoryChange(option.id)}
          className={[
            "flex shrink-0 items-center justify-center gap-x-2 rounded-lg h-9 px-4 transition-all",
            "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "ring-offset-white dark:ring-offset-gray-900",
            isSelected(option.id)
              ? "bg-primary text-white shadow-sm"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {option.icon && (
            <MaterialIcon
              name={option.icon}
              className={`text-[20px] ${isSelected(option.id) ? "text-white" : "text-gray-600 dark:text-gray-300"}`}
            />
          )}
          <span className="text-sm font-medium leading-normal whitespace-nowrap">
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}
