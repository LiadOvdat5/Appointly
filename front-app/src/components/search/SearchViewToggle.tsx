import { MaterialIcon } from "../UI/MaterialIcon";

interface SearchViewToggleProps {
  currentView: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
  className?: string;
}

/**
 * SearchViewToggle Component
 * Toggle button to switch between list and map views
 * Shows visual feedback for current mode
 */
export function SearchViewToggle({
  currentView,
  onViewChange,
  className,
}: SearchViewToggleProps) {
  return (
    <div
      className={[
        "flex items-center gap-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "shadow-sm p-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* List View Button */}
      <button
        onClick={() => onViewChange("list")}
        className={[
          "flex items-center justify-center p-2.5 rounded-md transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "ring-offset-white dark:ring-offset-gray-800",
          currentView === "list"
            ? "bg-primary text-white shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
        ]
          .filter(Boolean)
          .join(" ")}
        title="List view"
        aria-label="Switch to list view"
        aria-pressed={currentView === "list"}
      >
        <MaterialIcon name="list" className="text-[20px]" />
      </button>

      {/* Map View Button */}
      <button
        onClick={() => onViewChange("map")}
        className={[
          "flex items-center justify-center p-2.5 rounded-md transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "ring-offset-white dark:ring-offset-gray-800",
          currentView === "map"
            ? "bg-primary text-white shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
        ]
          .filter(Boolean)
          .join(" ")}
        title="Map view"
        aria-label="Switch to map view"
        aria-pressed={currentView === "map"}
      >
        <MaterialIcon name="map" className="text-[20px]" />
      </button>
    </div>
  );
}
