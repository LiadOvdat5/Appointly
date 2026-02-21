/**
 * Google Maps Configuration
 * Centralized configuration for Google Maps API integration
 */

/**
 * Google Maps API Key
 * Should be stored in environment variable: VITE_GOOGLE_MAPS_API_KEY
 */
export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

/**
 * Default map center (fallback location if geolocation fails)
 * Using San Francisco as default, can be configured per deployment
 */
export const DEFAULT_MAP_CENTER = {
  latitude: 37.7749,
  longitude: -122.4194,
};

/**
 * Map configuration options
 */
export const MAP_CONFIG = {
  zoom: 14,
  minZoom: 10,
  maxZoom: 20,
  tilt: 0,
  heading: 0,
  mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "", // Optional: for advanced styling
};

/**
 * Default search radius in miles
 */
export const DEFAULT_SEARCH_RADIUS = 5;

/**
 * Maximum search radius in miles
 */
export const MAX_SEARCH_RADIUS = 50;

/**
 * Marker clustering configuration
 */
export const CLUSTERING_CONFIG = {
  enabled: true,
  maxZoom: 15,
  algorithm: "SUPERCLUSTER", // Google's clustering algorithm
  gridSize: 50, // pixels
  minimumClusterSize: 2,
};

/**
 * Marker icons configuration
 */
export const MARKER_ICONS = {
  default: {
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
    fillColor: "#197fe6",
    fillOpacity: 1,
    scale: 1.5,
    strokeColor: "#fff",
    strokeWeight: 2,
  },
  selected: {
    fillColor: "#1a5fb8",
    fillOpacity: 1,
    scale: 1.8,
    strokeWeight: 3,
  },
  cluster: {
    fillColor: "#197fe6",
    fillOpacity: 0.8,
    scale: 1.5,
  },
};

/**
 * Map styles for light theme
 */
export const MAP_STYLE_LIGHT = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

/**
 * Map styles for dark theme
 */
export const MAP_STYLE_DARK = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3751ff" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
];

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  markerBounce: 750,
  mapPan: 500,
  markerClusterExpand: 300,
  bottomSheetSlide: 300,
};

/**
 * Search debounce delay (in milliseconds)
 */
export const SEARCH_DEBOUNCE_DELAY = 500;

/**
 * API request timeout (in milliseconds)
 */
export const API_REQUEST_TIMEOUT = 10000;

/**
 * Result pagination configuration
 */
export const PAGINATION = {
  pageSize: 20,
  initialLoad: 10,
};

/**
 * Business categories
 */
export const BUSINESS_CATEGORIES = [
  { id: "all", name: "All", icon: "star" },
  { id: "hair", name: "Hair", icon: "content_cut" },
  { id: "medical", name: "Medical", icon: "medical_services" },
  { id: "fitness", name: "Fitness", icon: "fitness_center" },
  { id: "spa", name: "Spa", icon: "spa" },
  { id: "dental", name: "Dental", icon: "local_pharmacy" },
  { id: "cafe", name: "Cafe", icon: "local_cafe" },
  { id: "restaurant", name: "Restaurant", icon: "restaurant" },
];

/**
 * Sort options for search results
 */
export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "distance", label: "Distance" },
  { value: "rating", label: "Rating" },
  { value: "reviews", label: "Most Reviewed" },
];
