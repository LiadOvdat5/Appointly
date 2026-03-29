import React, { useState } from "react";
import type { Business } from "../../types/search";
import { MaterialIcon } from "../UI/MaterialIcon";

interface BusinessCardProps {
  business: Business;
  variant?: "vertical" | "horizontal";
  onFavoriteClick?: (businessId: string, isFavorite: boolean) => void;
  onViewServicesClick?: (businessId: string) => void;
  onCardClick?: (businessId: string) => void;
  isFavorite?: boolean;
  currentUserId?: string;
  className?: string;
}

/**
 * BusinessCard Component
 * Displays business information in list view
 * Supports vertical (full-width) and horizontal (compact) layouts
 * Includes hover effects, favorite toggle, and action buttons
 */
export function BusinessCard({
  business,
  variant = "vertical",
  onFavoriteClick,
  onViewServicesClick,
  onCardClick,
  isFavorite = false,
  currentUserId,
  className,
}: BusinessCardProps) {
  // Hide the follow heart if this business belongs to the current user
  const showFollow = !currentUserId || business.ownerId !== currentUserId;
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteClick?.(business.id, !isFavorite);
  };

  const handleViewServices = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewServicesClick?.(business.id);
  };

  const handleCardClick = () => {
    onCardClick?.(business.id);
  };

  if (variant === "horizontal") {
    return (
      <div
        onClick={handleCardClick}
        className={[
          "flex flex-row rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700",
          "overflow-hidden cursor-pointer h-28 transition-shadow hover:shadow-md",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Image */}
        <div className="relative w-28 h-full shrink-0 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {!imageError && (
            <img
              src={business.imageUrl || "/placeholder-business.jpg"}
              alt={business.name}
              onLoad={() => setIsImageLoading(false)}
              onError={() => setImageError(true)}
              className={[
                "w-full h-full object-cover",
                isImageLoading ? "opacity-0" : "opacity-100",
                "transition-opacity duration-300",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          )}
          {(isImageLoading || imageError) && (
            <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700">
              <MaterialIcon name="image" className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center px-4 py-2 flex-1 min-w-0">
          <h3 className="text-gray-900 dark:text-white text-base font-bold leading-tight truncate">
            {business.name}
          </h3>

          {/* Rating + Distance */}
          {(business.rating || business.distance) && (
            <div className="flex items-center gap-1 mt-1 mb-2">
              {business.rating && (
                <>
                  <MaterialIcon name="star" className="text-primary text-[14px]" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {business.rating.toFixed(1)}
                  </span>
                </>
              )}
              {business.distance && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {business.rating ? "• " : ""}{business.distance.toFixed(1)} mi
                </span>
              )}
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleViewServices}
            className={[
              "w-fit flex items-center justify-center rounded bg-primary/10 text-primary px-3 py-1.5",
              "text-xs font-medium transition-colors hover:bg-primary/20 active:bg-primary/30",
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

  // Vertical/Default layout
  return (
    <div
      onClick={handleCardClick}
      className={[
        "flex flex-col rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700",
        "overflow-hidden group cursor-pointer transition-shadow hover:shadow-md",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {!imageError && (
          <img
            src={business.imageUrl || "/placeholder-business.jpg"}
            alt={business.name}
            onLoad={() => setIsImageLoading(false)}
            onError={() => setImageError(true)}
            className={[
              "w-full h-full object-cover transition-transform duration-500",
              isImageLoading ? "opacity-0" : "opacity-100",
              "group-hover:scale-105",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        )}
        {(isImageLoading || imageError) && (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700">
            <MaterialIcon name="image" className="text-gray-400" />
          </div>
        )}

        {/* Distance Badge */}
        {business.distance && (
          <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
            {business.distance.toFixed(1)} mi away
          </div>
        )}

        {/* Rating Badge */}
        {business.rating && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
            <MaterialIcon name="star" className="text-primary text-[14px]" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {business.rating.toFixed(1)}
            </span>
            {business.reviewCount && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                ({business.reviewCount})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-4 gap-2">
        {/* Header with Title and Favorite Button */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">
              {business.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-1">
              <MaterialIcon name="location_on" className="text-[16px]" />
              {business.location.address}
              {business.distance && (
                <span>• {business.distance.toFixed(1)} mi</span>
              )}
            </p>
          </div>

          {/* Follow Button — hidden for user's own businesses */}
          {showFollow && (
            <button
              onClick={handleFavoriteClick}
              className={[
                "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isFavorite
                  ? "bg-red-100 text-red-500"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500",
              ]
                .filter(Boolean)
                .join(" ")}
              title={isFavorite ? "Unfollow" : "Follow"}
              aria-label={isFavorite ? "Unfollow" : "Follow"}
            >
              <MaterialIcon
                name="favorite"
                className={["text-[20px]", isFavorite ? "icon-filled" : ""].filter(Boolean).join(" ")}
              />
            </button>
          )}
        </div>

        {/* Services Tags */}
        {business.services.length > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {business.services.slice(0, 2).map((service) => (
              <span
                key={service.id}
                className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium"
              >
                {service.name}
              </span>
            ))}
            {business.services.length > 2 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                +{business.services.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleViewServices}
          className={[
            "mt-2 w-full flex items-center justify-center rounded-lg h-10 bg-primary hover:brightness-95",
            "active:brightness-90 active:scale-[0.99] transition-all",
            "text-white text-sm font-medium",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          View Business
        </button>
      </div>
    </div>
  );
}
