import { useRef, useEffect, useState } from "react";
import type { Business } from "../../types/search";
import { MaterialIcon } from "../UI/MaterialIcon";
import { useGoogleMaps } from "../../hooks/useGoogleMaps";
import { useMapMarkers } from "../../hooks/useMapMarkers";
import {
  MARKER_ICONS,
  MAP_STYLE_LIGHT,
  MAP_STYLE_DARK,
  CLUSTERING_CONFIG,
} from "../../constants/googleMapsConfig";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

interface SearchMapViewProps {
  results: Business[];
  loading: boolean;
  error: string | null;
  userLocation?: { latitude: number; longitude: number } | null;
  selectedMarkerId?: string | null;
  onMarkerClick?: (businessId: string) => void;
  onBusinessClick?: (businessId: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenterLocation?: () => void;
  className?: string;
}

/**
 * SearchMapView Component
 * Displays businesses on a Google Map with marker interactions
 * Initializes markers and clusters when map is ready
 */
export function SearchMapView({
  results,
  loading,
  error,
  userLocation,
  selectedMarkerId,
  onMarkerClick,
  onBusinessClick,
  onZoomIn,
  onZoomOut,
  onCenterLocation,
  className,
}: SearchMapViewProps) {
  const googleMaps = useGoogleMaps();
  const { markers } = useMapMarkers(results, {
    userLocation: userLocation ?? null,
  });

  const [isMapReady, setIsMapReady] = useState(false);
  const markerInstancesRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const markerClusterRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Show error state (search error or Google Maps load error)
  const mapError = error ?? googleMaps.error ?? null;
  if (mapError) {
    return (
      <div
        className={[
          "flex-1 flex items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-900",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MaterialIcon
              name="error_outline"
              className="text-[48px] text-red-500"
            />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Map failed to load
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {String(mapError)}
          </p>
        </div>
      </div>
    );
  }

  // Determine light/dark preference once
  const prefersDark =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;

  // When Google Maps API is loaded, attach style and initialize helpers
  useEffect(() => {
    if (!googleMaps.isLoaded || !googleMaps.mapInstance) return;

    const map = googleMaps.mapInstance;

    map.setOptions({ styles: prefersDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT });

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    // Center map on user location if available
    if (userLocation) {
      map.setCenter({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      map.setZoom(14);
    }

    setIsMapReady(true);
  }, [googleMaps.isLoaded, googleMaps.mapInstance, userLocation, prefersDark]);

  // Create markers when marker list changes
  useEffect(() => {
    if (!isMapReady || !googleMaps.mapInstance) return;
    const map = googleMaps.mapInstance;

    // Cleanup existing markers & clusters
    markerInstancesRef.current.forEach((m) => m.setMap(null));
    markerInstancesRef.current.clear();
    if (markerClusterRef.current) {
      try {
        (markerClusterRef.current as any).clearMarkers?.();
      } catch (e) {
        // ignore
      }
      markerClusterRef.current = null;
    }

    const createdMarkers: google.maps.Marker[] = [];

    markers.forEach((m) => {
      const pos = new google.maps.LatLng(
        m.position.latitude,
        m.position.longitude,
      );
      const marker = new google.maps.Marker({
        position: pos,
        title: m.title,
        map,
        icon: {
          path: MARKER_ICONS.default.path,
          fillColor: MARKER_ICONS.default.fillColor,
          fillOpacity: MARKER_ICONS.default.fillOpacity,
          strokeColor: MARKER_ICONS.default.strokeColor,
          strokeWeight: MARKER_ICONS.default.strokeWeight,
          scale: MARKER_ICONS.default.scale,
        } as any,
      });

      markerInstancesRef.current.set(m.businessId, marker);
      createdMarkers.push(marker);

      marker.addListener("click", () => {
        onMarkerClick?.(m.businessId);
        const ratingStr = m.rating != null ? `<div style="font-size:12px;color:#666">${m.rating.toFixed(1)} ★</div>` : "";
        const content = `<div style="min-width:160px"><strong>${m.title}</strong>${ratingStr}</div>`;
        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open({ anchor: marker, map });
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 700);
      });
    });

    // Create clusterer if enabled and markers exist
    if (CLUSTERING_CONFIG.enabled && createdMarkers.length > 0) {
      markerClusterRef.current = new MarkerClusterer({
        markers: createdMarkers,
        map,
      });
    }

    // Fit bounds
    if (createdMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      createdMarkers.forEach((m) =>
        bounds.extend(m.getPosition() as google.maps.LatLng),
      );
      map.fitBounds(bounds);
    }

    return () => {
      markerInstancesRef.current.forEach((m) => m.setMap(null));
      markerInstancesRef.current.clear();
      if (markerClusterRef.current) {
        try {
          (markerClusterRef.current as any).clearMarkers?.();
        } catch (e) {}
        markerClusterRef.current = null;
      }
    };
  }, [markers, isMapReady, googleMaps.mapInstance, onMarkerClick]);

  // Focus selected marker
  useEffect(() => {
    if (!selectedMarkerId) return;
    const marker = markerInstancesRef.current.get(selectedMarkerId);
    if (!marker || !googleMaps.mapInstance) return;

    googleMaps.mapInstance.panTo(marker.getPosition() as google.maps.LatLng);
    googleMaps.mapInstance.setZoom(
      Math.max(15, Number(googleMaps.mapInstance.getZoom() ?? 15)),
    );

    const content = `<div style="min-width:160px"><strong>${marker.getTitle()}</strong></div>`;
    infoWindowRef.current?.setContent(content);
    infoWindowRef.current?.open({
      anchor: marker,
      map: googleMaps.mapInstance,
    });

    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(() => marker.setAnimation(null), 700);
  }, [selectedMarkerId, googleMaps.mapInstance]);

  const handleZoomInClick = () => {
    if (!googleMaps.mapInstance) return;
    {
      const current = Number(googleMaps.mapInstance.getZoom() ?? 14);
      googleMaps.mapInstance.setZoom(
        Math.min(current + 1, (googleMaps.mapInstance as any).maxZoom ?? 20),
      );
    }
    onZoomIn?.();
  };

  const handleZoomOutClick = () => {
    if (!googleMaps.mapInstance) return;
    {
      const current = Number(googleMaps.mapInstance.getZoom() ?? 14);
      googleMaps.mapInstance.setZoom(
        Math.max(current - 1, (googleMaps.mapInstance as any).minZoom ?? 1),
      );
    }
    onZoomOut?.();
  };

  const handleCenterLocationClick = () => {
    if (!userLocation || !googleMaps.mapInstance) return;
    googleMaps.mapInstance.panTo({
      lat: userLocation.latitude,
      lng: userLocation.longitude,
    });
    googleMaps.mapInstance.setZoom(14);
    onCenterLocation?.();
  };

  return (
    <div
      className={[
        "relative flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute inset-0">
        {/* Mount hook-provided map ref */}
        <div ref={googleMaps.mapRef} className="w-full h-full" />
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomInClick}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 shadow-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <MaterialIcon name="add" className="text-[20px]" />
        </button>
        <button
          onClick={handleZoomOutClick}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 shadow-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <MaterialIcon name="remove" className="text-[20px]" />
        </button>
        {userLocation && (
          <button
            onClick={handleCenterLocationClick}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 shadow-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="Center on your location"
            aria-label="Center on your location"
          >
            <MaterialIcon name="my_location" className="text-[20px]" />
          </button>
        )}
      </div>

      {/* Results Count Badge */}
      <div className="absolute top-20 left-4 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {results.length}
          <span className="text-gray-600 dark:text-gray-400"> results</span>
        </p>
      </div>

      {/* Bottom Sheet Preview */}
      {results.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-10">
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="px-4 pb-4 overflow-x-auto">
            <div className="flex gap-3 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {results.slice(0, 5).map((business) => (
                <div
                  key={business.id}
                  onClick={() => onMarkerClick?.(business.id)}
                  className={[
                    "flex-shrink-0 w-56 rounded-lg overflow-hidden cursor-pointer transition-all",
                    "bg-white dark:bg-gray-700 shadow-sm border-2",
                    selectedMarkerId === business.id
                      ? "border-primary shadow-lg"
                      : "border-gray-100 dark:border-gray-600 hover:shadow-md",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 overflow-hidden">
                    {business.imageUrl ? (
                      <img
                        src={business.imageUrl}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <MaterialIcon name="image" className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-gray-900 dark:text-white text-sm font-bold truncate">
                      {business.name}
                    </h4>
                    {business.rating && (
                      <div className="flex items-center gap-1 mt-1 mb-3">
                        <MaterialIcon
                          name="star"
                          className="text-primary text-[14px]"
                        />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {business.rating.toFixed(1)}
                        </span>
                        {business.reviewCount && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            • {business.reviewCount} reviews
                          </span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBusinessClick?.(business.id);
                      }}
                      className="w-full bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg py-2 text-xs font-bold transition-colors hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {loading && (
            <div className="px-4 py-6 flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Loading results...
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State Overlay */}
      {!loading && results.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-5">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-xl">
            <MaterialIcon
              name="location_off"
              className="text-[40px] text-gray-400 mb-3 flex justify-center"
            />
            <h3 className="text-gray-900 dark:text-white font-bold mb-1">
              No results found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Try adjusting your search
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
