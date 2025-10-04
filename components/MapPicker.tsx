"use client";

import { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";

interface GoogleMapPickerProps {
  location: string;
  onLocationChange: (location: string, coords: { lat: number; lng: number }) => void;
}

const libraries: ("places")[] = ["places"];

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "12px",
};

const centerDefault = { lat: 28.6139, lng: 77.2090 }; // Default center

export default function GoogleMapPicker({
  location,
  onLocationChange,
}: GoogleMapPickerProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["geometry", "formatted_address"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current!.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setSelected({ lat, lng });
      map?.panTo({ lat, lng });
      onLocationChange(place.formatted_address!, { lat, lng });
    });
  }, [isLoaded, map]);

  // Update marker if user types manually
  useEffect(() => {
    if (!location || !map) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results && results[0].geometry.location) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        setSelected({ lat, lng });
        map.panTo({ lat, lng });
      }
    });
  }, [location, map]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search location..."
        className="w-full h-12 px-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={location}
        onChange={(e) => onLocationChange(e.target.value, selected || centerDefault)}
      />

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={12}
        center={selected || centerDefault}
        onLoad={(map) => setMap(map)}
        onClick={(e) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setSelected({ lat, lng });

            // Reverse geocode to get address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                onLocationChange(results[0].formatted_address!, { lat, lng });
              } else {
                onLocationChange("", { lat, lng });
              }
            });
          }
        }}
      >
        {selected && (
          <Marker
            position={selected}
            draggable
            onDragEnd={(e) => {
              if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setSelected({ lat, lng });

                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                  if (status === "OK" && results && results[0]) {
                    onLocationChange(results[0].formatted_address!, { lat, lng });
                  } else {
                    onLocationChange("", { lat, lng });
                  }
                });
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
