import { useMemo, useCallback, useRef, useEffect } from "react";
import type { Business, MapMarker, LocationCoords } from "../types/search";
import {
  calculateDistance,
  filterByRadius,
  sortByDistance,
} from "../services/businessService";
import { CLUSTERING_CONFIG } from "../constants/googleMapsConfig";

interface UseMapMarkersOptions {
  enableClustering?: boolean;
  userLocation?: LocationCoords | null;
  radiusFilter?: number;
}

interface ClusterMarker extends MapMarker {
  isCluster: boolean;
  clusterSize: number;
}

interface UseMapMarkersReturn {
  markers: MapMarker[];
  clusteredMarkers: (MapMarker | ClusterMarker)[];
  addMarker: (business: Business) => void;
  removeMarker: (businessId: string) => void;
  clearMarkers: () => void;
  updateMarkers: (businesses: Business[]) => void;
  getMarkerById: (businessId: string) => MapMarker | undefined;
  sortMarkersByDistance: () => MapMarker[];
}

/**
 * useMapMarkers Hook
 * Converts business results to map markers
 * Handles marker creation, updates, and clustering
 * Manages marker interactions and filtering
 */
export function useMapMarkers(
  businesses: Business[],
  options: UseMapMarkersOptions = {},
): UseMapMarkersReturn {
  const {
    enableClustering = CLUSTERING_CONFIG.enabled,
    userLocation = null,
    radiusFilter = 50,
  } = options;

  const markersRef = useRef<Map<string, MapMarker>>(new Map());

  /**
   * Convert business to map marker
   */
  const businessToMarker = useCallback((business: Business): MapMarker => {
    return {
      businessId: business.id,
      position: {
        latitude: business.coordinates.latitude,
        longitude: business.coordinates.longitude,
      },
      title: business.name,
      rating: business.rating,
      category: business.category,
      imageUrl: business.imageUrl,
      infoWindowData: {
        name: business.name,
        rating: business.rating,
        distance: business.distance,
      },
    };
  }, []);

  /**
   * Convert businesses to markers
   */
  const convertToMarkers = useCallback(
    (businesses: Business[]): MapMarker[] => {
      let filteredBusinesses = businesses;

      // Apply radius filter if user location is available
      if (userLocation && radiusFilter) {
        filteredBusinesses = filterByRadius(
          filteredBusinesses,
          userLocation,
          radiusFilter,
        );
      }

      // Sort by distance if user location is available
      if (userLocation) {
        filteredBusinesses = sortByDistance(filteredBusinesses, userLocation);
      }

      return filteredBusinesses.map(businessToMarker);
    },
    [businessToMarker, userLocation, radiusFilter],
  );

  /**
   * Create marker clusters for better performance
   */
  const createClusters = useCallback(
    (markers: MapMarker[]): (MapMarker | ClusterMarker)[] => {
      if (
        !enableClustering ||
        markers.length < CLUSTERING_CONFIG.minimumClusterSize
      ) {
        return markers;
      }

      // Simple clustering algorithm - groups markers by grid cells
      // In production, use Google's MarkerClusterer library
      const clusters = new Map<string, MapMarker[]>();
      const gridSize = CLUSTERING_CONFIG.gridSize;

      markers.forEach((marker) => {
        const gridX = Math.floor(
          marker.position.latitude / (gridSize / 111.32),
        );
        const gridY = Math.floor(
          marker.position.longitude / (gridSize / 111.32),
        );
        const gridKey = `${gridX}-${gridY}`;

        if (!clusters.has(gridKey)) {
          clusters.set(gridKey, []);
        }
        clusters.get(gridKey)!.push(marker);
      });

      // Convert clusters to cluster markers or individual markers
      const result: (MapMarker | ClusterMarker)[] = [];
      clusters.forEach((clusterMarkers) => {
        if (clusterMarkers.length >= CLUSTERING_CONFIG.minimumClusterSize) {
          // Create cluster marker
          const avgLat =
            clusterMarkers.reduce((sum, m) => sum + m.position.latitude, 0) /
            clusterMarkers.length;
          const avgLng =
            clusterMarkers.reduce((sum, m) => sum + m.position.longitude, 0) /
            clusterMarkers.length;

          result.push({
            ...clusterMarkers[0],
            position: { latitude: avgLat, longitude: avgLng },
            isCluster: true,
            clusterSize: clusterMarkers.length,
          });
        } else {
          // Add individual markers
          result.push(...clusterMarkers);
        }
      });

      return result;
    },
    [enableClustering],
  );

  /**
   * All markers memoized
   */
  const markers = useMemo(() => {
    return convertToMarkers(businesses);
  }, [businesses, convertToMarkers]);

  /**
   * Clustered markers memoized
   */
  const clusteredMarkers = useMemo(() => {
    return createClusters(markers);
  }, [markers, createClusters]);

  /**
   * Add single marker
   */
  const addMarker = useCallback(
    (business: Business) => {
      const marker = businessToMarker(business);
      markersRef.current.set(business.id, marker);
    },
    [businessToMarker],
  );

  /**
   * Remove single marker
   */
  const removeMarker = useCallback((businessId: string) => {
    markersRef.current.delete(businessId);
  }, []);

  /**
   * Clear all markers
   */
  const clearMarkers = useCallback(() => {
    markersRef.current.clear();
  }, []);

  /**
   * Update markers from businesses array
   */
  const updateMarkers = useCallback(
    (businesses: Business[]) => {
      clearMarkers();
      businesses.forEach((business) => {
        addMarker(business);
      });
    },
    [clearMarkers, addMarker],
  );

  /**
   * Get marker by business ID
   */
  const getMarkerById = useCallback(
    (businessId: string): MapMarker | undefined => {
      return markers.find((m) => m.businessId === businessId);
    },
    [markers],
  );

  /**
   * Get markers sorted by distance
   */
  const sortMarkersByDistance = useCallback((): MapMarker[] => {
    if (!userLocation) return markers;
    return markers.sort((a, b) => {
      const distA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.position.latitude,
        a.position.longitude,
      );
      const distB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.position.latitude,
        b.position.longitude,
      );
      return distA - distB;
    });
  }, [markers, userLocation]);

  // Update ref when markers change
  useEffect(() => {
    markersRef.current.clear();
    markers.forEach((marker) => {
      markersRef.current.set(marker.businessId, marker);
    });
  }, [markers]);

  return {
    markers,
    clusteredMarkers,
    addMarker,
    removeMarker,
    clearMarkers,
    updateMarkers,
    getMarkerById,
    sortMarkersByDistance,
  };
}
