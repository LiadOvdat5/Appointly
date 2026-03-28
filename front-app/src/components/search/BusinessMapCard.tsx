import React from "react";
import type { Business } from "../../types/search";
import { MaterialIcon } from "../UI/MaterialIcon";

interface BusinessMapCardProps {
  business: Business;
  isSelected?: boolean;
  onClick?: (businessId: string) => void;
  onBookClick?: (businessId: string) => void;
  className?: string;
}

/**
 * BusinessMapCard Component
 * Compact business card for map view bottom sheet
 * Designed for horizontal scrolling carousel in bottom sheet
 * Shows essential info with image, rating, and book button
 */
export function BusinessMapCard({
  business,
  isSelected = false,
  onClick,
  onBookClick,
  className,
}: BusinessMapCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  const handleClick = () => {
    onClick?.(business.id);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookClick?.(business.id);
  };

  return (
    <div
      onClick={handleClick}
      className={[
        "flex flex-shrink-0 flex-col gap-3 rounded-lg overflow-hidden cursor-pointer transition-all",
        "bg-white dark:bg-gray-700 shadow-sm border-2 w-56",
        isSelected
          ? "border-primary shadow-lg"
          : "border-gray-100 dark:border-gray-600 hover:shadow-md hover:border-primary/30",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-600 overflow-hidden">
        {!imageError && (
          <img
            src={business.imageUrl || "/placeholder-business.jpg"}
            alt={business.name}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageError(true)}
            className={[
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoading ? "opacity-0" : "opacity-100",
              isSelected ? "scale-105" : "group-hover:scale-105",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        )}
        {(imageError || imageLoading) && (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-600">
            <MaterialIcon name="image" className="text-gray-400 text-[32px]" />
          </div>
        )}

        {/* Distance Badge */}
        {business.distance && (
          <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
            {business.distance.toFixed(1)} mi
          </div>
        )}

        {/* Rating Badge */}
        {business.rating && (
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1 shadow-sm">
            <MaterialIcon name="star" className="text-primary text-[12px]" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {business.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 px-3 pb-3 pt-0">
        {/* Title and Reviews */}
        <div>
          <h4 className="text-gray-900 dark:text-white text-sm font-bold truncate">
            {business.name}
          </h4>
          {business.reviewCount && (
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5 truncate">
              {business.reviewCount} reviews
            </p>
          )}
        </div>

        {/* Services Preview */}
        {business.services.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {business.services.slice(0, 2).map((service) => (
              <span
                key={service.id}
                className="bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded truncate"
              >
                {service.name}
              </span>
            ))}
          </div>
        )}

        {/* Book Now Button */}
        <button
          onClick={handleBookClick}
          className={[
            "w-full rounded-lg py-2 text-xs font-bold transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isSelected
              ? "bg-primary text-white hover:brightness-95"
              : "bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
