"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Card } from "./ui/card";

interface GoogleMapPickerProps {
  location: string;
  lat?: number;
  lng?: number;
  onLocationChange: (location: string, coords: { lat: number; lng: number }) => void;
}

const libraries: ("places")[] = ["places"];

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "12px",
};

const centerDefault = { lat: 28.6139, lng: 77.2090 };

export default function MapPicker({ location, lat, lng, onLocationChange }: GoogleMapPickerProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [selected, setSelected] = useState<{ lat: number; lng: number }>(
    lat && lng ? { lat, lng } : centerDefault
  );
  const [map, setMap] = useState<google.maps.Map | null>(null);

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
    <Card className="py-0 shadow-2xl">
      <GoogleMap
      mapContainerStyle={containerStyle}
      zoom={12}
      center={selected}
      onLoad={(map) => setMap(map)}
      onClick={(e) => {
        if (!e.latLng) return;
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
      }}
    >
      {selected && (
        <Marker
          position={selected}
          draggable
          onDragEnd={(e) => {
            const lat = e.latLng!.lat();
            const lng = e.latLng!.lng();
            setSelected({ lat, lng });

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                onLocationChange(results[0].formatted_address!, { lat, lng });
              } else {
                onLocationChange("", { lat, lng });
              }
            });
          }}
        />
      )}
    </GoogleMap>
    </Card>
  );
}
