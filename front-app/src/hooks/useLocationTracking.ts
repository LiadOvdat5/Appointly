import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  setUserLocation,
  setLocationLoading,
  setLocationError,
  setLocationPermission,
} from "../features/search/searchSlice";
import { DEFAULT_MAP_CENTER } from "../constants/googleMapsConfig";
import type { LocationCoords, LocationPermissionState } from "../types/search";

interface UseLocationTrackingOptions {
  enableWatch?: boolean;
  timeout?: number; // milliseconds
  maximumAge?: number; // milliseconds
  useDefaultLocation?: boolean;
}

interface UseLocationTrackingReturn {
  location: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  permission: LocationPermissionState;
  requestLocation: () => Promise<void>;
  watchPosition: () => number | null;
  clearWatch: (watchId: number) => void;
}

/**
 * useLocationTracking Hook
 * Manages user geolocation with fallback support
 * Integrates with Redux for state persistence
 * Handles permission requests and error cases
 */
export function useLocationTracking(
  options: UseLocationTrackingOptions = {},
): UseLocationTrackingReturn {
  const {
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    useDefaultLocation = true,
  } = options;

  const dispatch = useDispatch();
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] =
    useState<LocationPermissionState>("unknown");
  const watchIdRef = useRef<number | null>(null);

  /**
   * Check if geolocation is available
   */
  const isGeolocationAvailable = useCallback((): boolean => {
    return "geolocation" in navigator;
  }, []);

  /**
   * Check permission status
   */
  const checkPermissionStatus = useCallback(async () => {
    if (!("permissions" in navigator)) {
      setPermission("unknown");
      return;
    }

    try {
      const result = await navigator.permissions.query({
        name: "geolocation",
      });
      setPermission(result.state as LocationPermissionState);
    } catch (err) {
      setPermission("unknown");
    }
  }, []);

  /**
   * Request user location
   */
  const requestLocation = useCallback(async (): Promise<void> => {
    if (!isGeolocationAvailable()) {
      const errorMsg = "Geolocation is not supported by your browser";
      setError(errorMsg);
      dispatch(setLocationError(errorMsg));

      if (useDefaultLocation) {
        const defaultLocation: LocationCoords = {
          latitude: DEFAULT_MAP_CENTER.latitude,
          longitude: DEFAULT_MAP_CENTER.longitude,
        };
        setLocation(defaultLocation);
        dispatch(setUserLocation(defaultLocation));
      }
      return;
    }

    setIsLoading(true);
    dispatch(setLocationLoading(true));
    setError(null);
    dispatch(setLocationError(null));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setLocation(coords);
          setIsLoading(false);
          setPermission("granted");
          dispatch(setUserLocation(coords));
          dispatch(setLocationLoading(false));
          dispatch(setLocationPermission("granted"));
          resolve();
        },
        (err) => {
          let errorMsg = "Failed to get location";
          let permissionStatus: LocationPermissionState = "prompt";

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = "Permission to access location was denied";
              permissionStatus = "denied";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg = "Location information is unavailable";
              break;
            case err.TIMEOUT:
              errorMsg = "Location request timed out";
              break;
          }

          setError(errorMsg);
          setIsLoading(false);
          setPermission(permissionStatus);
          dispatch(setLocationError(errorMsg));
          dispatch(setLocationLoading(false));
          dispatch(setLocationPermission(permissionStatus));

          // Use default location if requested
          if (useDefaultLocation && permissionStatus !== "denied") {
            const defaultLocation: LocationCoords = {
              latitude: DEFAULT_MAP_CENTER.latitude,
              longitude: DEFAULT_MAP_CENTER.longitude,
            };
            setLocation(defaultLocation);
            dispatch(setUserLocation(defaultLocation));
          }

          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout,
          maximumAge,
        },
      );
    });
  }, [
    isGeolocationAvailable,
    useDefaultLocation,
    timeout,
    maximumAge,
    dispatch,
  ]);

  /**
   * Watch position updates (optional)
   */
  const watchPosition = useCallback((): number | null => {
    if (!isGeolocationAvailable() || watchIdRef.current !== null) {
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: LocationCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setLocation(coords);
        dispatch(setUserLocation(coords));
      },
      (err) => {
        console.error("Watch position error:", err);
      },
      {
        enableHighAccuracy: true,
        timeout,
        maximumAge,
      },
    );

    watchIdRef.current = watchId;
    return watchId;
  }, [isGeolocationAvailable, timeout, maximumAge, dispatch]);

  /**
   * Clear watch position
   */
  const clearWatch = useCallback(
    (watchId: number) => {
      if (watchId && isGeolocationAvailable()) {
        navigator.geolocation.clearWatch(watchId);
        watchIdRef.current = null;
      }
    },
    [isGeolocationAvailable],
  );

  /**
   * Check permission status on mount
   */
  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  /**
   * Cleanup watch on unmount
   */
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && isGeolocationAvailable()) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isGeolocationAvailable]);

  return {
    location,
    isLoading,
    error,
    permission,
    requestLocation,
    watchPosition,
    clearWatch,
  };
}
