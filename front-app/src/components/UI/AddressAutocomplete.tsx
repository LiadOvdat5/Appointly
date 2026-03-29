import { useEffect, useRef, useState, useId } from "react";
import { GOOGLE_MAPS_API_KEY } from "../../constants/googleMapsConfig";
import { MaterialIcon } from "./MaterialIcon";

export interface AddressResult {
  address: string;
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  /** Called when user selects a place from the dropdown */
  onAddressSelect: (result: AddressResult) => void;
  /** Called on raw text changes (typing without selecting a suggestion) */
  onValueChange?: (value: string) => void;
  error?: string;
}

/**
 * Loads the Google Maps JS API script once, reusing it if already loading/loaded.
 */
function loadMapsScript(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();

  // Script already in DOM (loaded by another component like useGoogleMaps)
  const existing = document.querySelector<HTMLScriptElement>(
    'script[src*="maps.googleapis.com/maps/api/js"]',
  );
  if (existing) {
    return new Promise((resolve) => {
      const check = () => {
        if (window.google?.maps) { resolve(); return; }
        setTimeout(check, 100);
      };
      check();
    });
  }

  if (!apiKey) return Promise.reject(new Error("Google Maps API key missing"));

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps API"));
    document.head.appendChild(script);
  });
}

/**
 * Address input with Google Places Autocomplete.
 * Emits a validated AddressResult (address string + lat/lng) on place selection.
 */
export function AddressAutocomplete({
  label,
  placeholder = "Search for an address...",
  value,
  onAddressSelect,
  onValueChange,
  error,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onSelectRef = useRef(onAddressSelect);
  const [apiReady, setApiReady] = useState(Boolean(window.google?.maps));
  const id = useId();

  // Keep callback ref current on every render
  useEffect(() => {
    onSelectRef.current = onAddressSelect;
  });

  // Load Maps API
  useEffect(() => {
    if (apiReady) return;
    loadMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => setApiReady(true))
      .catch(() => {});
  }, [apiReady]);

  // Attach Places Autocomplete once API is ready
  useEffect(() => {
    if (!apiReady || !inputRef.current || autocompleteRef.current) return;

    const ac = new window.google!.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;

      onSelectRef.current({
        address: place.formatted_address ?? inputRef.current!.value,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      });
    });

    autocompleteRef.current = ac;
  }, [apiReady]);

  const inputCls = [
    "w-full rounded-lg border bg-white p-3 pl-10 text-[#111418] outline-none transition",
    "focus:ring-2 focus:ring-primary",
    "dark:bg-gray-900 dark:text-white dark:border-gray-700",
    error ? "border-danger focus:ring-danger" : "border-gray-300",
  ].join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[#111418] dark:text-gray-200"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <MaterialIcon name="location_on" className="text-sm" />
        </span>
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className={inputCls}
        />
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
