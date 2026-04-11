import { useEffect, useRef } from "react";

interface AddressMapPreviewProps {
  latitude: number;
  longitude: number;
}

export function AddressMapPreview({ latitude, longitude }: AddressMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

    const position = { lat: latitude, lng: longitude };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: "cooperative",
      });
      markerRef.current = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
      });
    } else {
      mapInstanceRef.current.panTo(position);
      markerRef.current?.setPosition(position);
    }
  }, [latitude, longitude]);

  return (
    <div
      ref={mapRef}
      className="w-full h-44 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
    />
  );
}
