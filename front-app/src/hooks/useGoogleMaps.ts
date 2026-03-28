import { useEffect, useRef, useState, useCallback } from "react";
import { GOOGLE_MAPS_API_KEY, MAP_CONFIG } from "../constants/googleMapsConfig";

declare global {
  interface Window {
    google?: {
      maps: typeof google.maps;
    };
  }
}

interface UseGoogleMapsOptions {
  apiKey?: string;
  libraries?: string[];
  language?: string;
  region?: string;
}

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  google: Window["google"] | null;
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapInstance: google.maps.Map | null;
}

/**
 * useGoogleMaps Hook
 * Lazily loads Google Maps API and initializes map instance
 * Handles loading states and errors
 * Provides access to Google Maps API and map instance
 */
export function useGoogleMaps(
  options: UseGoogleMapsOptions = {},
): UseGoogleMapsReturn {
  const {
    apiKey = GOOGLE_MAPS_API_KEY,
    libraries = ["places", "marker"],
    language = "en",
    region = "US",
  } = options;

  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const scriptRef = useRef<HTMLScriptElement | null>(null);

  /**
   * Load Google Maps API script
   */
  const loadGoogleMapsScript = useCallback(() => {
    // Check if API is already loaded
    if (window.google?.maps) {
      return;
    }

    // Check if script is already loading
    if (scriptRef.current) {
      return;
    }

    if (!apiKey) {
      const errorMsg = "Google Maps API key is required";
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(",")}&language=${language}&region=${region}`;
    script.async = true;
    script.defer = true;

    // Handle script load
    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
      setError(null);
    };

    // Handle script error
    script.onerror = () => {
      const errorMsg = "Failed to load Google Maps API";
      setError(errorMsg);
      setIsLoading(false);
      scriptRef.current = null;
    };

    scriptRef.current = script;
    document.head.appendChild(script);
  }, [apiKey, libraries, language, region]);

  /**
   * Initialize map instance
   */
  const initializeMap = useCallback(() => {
    if (!window.google?.maps || !mapRef.current) {
      return;
    }

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: MAP_CONFIG.zoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        tilt: MAP_CONFIG.tilt,
        heading: MAP_CONFIG.heading,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
      });

      setMapInstance(map);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to initialize map";
      setError(errorMsg);
    }
  }, []);

  /**
   * Load script on mount — or mark as loaded if the API is already available
   * (e.g. when the component remounts after navigating away and back)
   */
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      setIsLoading(false);
    } else {
      loadGoogleMapsScript();
    }
  }, [loadGoogleMapsScript]);

  /**
   * Initialize map when API is loaded and DOM is ready
   */
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstance) {
      initializeMap();
    }
  }, [isLoaded, initializeMap, mapInstance]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Script cleanup is handled by the script tag itself
    };
  }, []);

  return {
    isLoaded,
    isLoading,
    error,
    google: window.google || null,
    mapRef,
    mapInstance,
  };
}
