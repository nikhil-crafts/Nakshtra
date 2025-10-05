"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLoadScript } from "@react-google-maps/api";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, MapPinIcon, CloudRainIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { EventData } from "@/types/weather";
import { useRouter } from "next/navigation";
import MapPicker from "@/components/MapPicker";

interface Thresholds {
  hot?: number;
  cold?: number;
  windy?: number;
  rain?: number;
}

const globalThresholds: Thresholds = {
  hot: 35,
  cold: 5,
  windy: 30,
  rain: 20,
};

const Landing = () => {
  const [eventData, setEventData] = useState<
    Partial<EventData> & { lat?: number; lng?: number }
  >({
    location: "",
    date: undefined,
    lat: undefined,
    lng: undefined,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [thresholds, setThresholds] = useState<Thresholds>({});
  const [userThresholds, setUserThresholds] = useState<Thresholds | null>(null);
  const [submit, setSubmit] = useState(false);
  const router = useRouter();

  const libraries: "places"[] = ["places"];

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["geometry", "formatted_address"],
        types: ["geocode"],
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current!.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setEventData({
        ...eventData,
        location: place.formatted_address!,
        lat,
        lng,
      });
    });
  }, [isLoaded]);
  // Load saved thresholds (if user is logged in)
  useEffect(() => {
    async function fetchUserPreferences() {
      try {
        const res = await fetch("/api/user/preferences"); // returns user's saved thresholds
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setUserThresholds(data);
            setThresholds(data); // prefill thresholds if user has preferences
          }
        }
      } catch (err) {
        console.error("Error fetching user preferences:", err);
      }
    }
    fetchUserPreferences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmit(true);

    if (!eventData.location || !eventData.date) return;

    try {
      // Base query params
      const params = new URLSearchParams({
        lat: (eventData.lat ?? "").toString(),
        lon: (eventData.lng ?? "").toString(),
        date_of_trip: format(eventData.date!, "yyyyMMdd"),
      });

      // Include user preferences if available
      console.log(sessionStorage)
      const storedPrefs = sessionStorage.getItem("userPreferences");
      if (storedPrefs) {
        const prefs = JSON.parse(storedPrefs);
        if (prefs.maxComfortableTemp !== undefined)
          params.append("hot", prefs.maxComfortableTemp.toString());
        if (prefs.minComfortableTemp !== undefined)
          params.append("cold", prefs.minComfortableTemp.toString());
        if (prefs.maxWindTolerance !== undefined)
          params.append("windy", prefs.maxWindTolerance.toString());
        if (prefs.rainTolerance !== undefined)
          params.append("rain", prefs.rainTolerance.toString());
      }

      // Call Next.js API route
      const res = await fetch(`/api/weather?${params.toString()}`);
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to fetch weather risk");

      console.log("✅ Weather Risk Response:", data);

      // Save API response for dashboard
      setEventData((prev) => ({ ...prev, apiResponse: data }));
      sessionStorage.setItem(
        "eventData",
        JSON.stringify({ ...eventData, apiResponse: data })
      );

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    }
  };

  const handleLocationChange = (
    location: string,
    coords: { lat: number; lng: number }
  ) => {
    setEventData({ ...eventData, location, lat: coords.lat, lng: coords.lng });
  };

  const isFormValid = eventData.location && eventData.date;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-25">
        <div className="space-y-8 bg-transparent mt-11">
          <Card className="weather-card border-0 shadow-2xl h-full backdrop-blur-3xl ">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl">Event Weather Risk</CardTitle>
              <CardDescription>
                Get weather risk insights for your upcoming event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Location Input */}
                <div className="space-y-3">
                  <label htmlFor="location" className="text-sm font-medium">
                    Event Location
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search location..."
                    className="w-full h-12 px-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventData.location || ""}
                    onChange={(e) =>
                      setEventData({ ...eventData, location: e.target.value })
                    }
                  />
                </div>
                {/* Date Picker */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Date</label>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal rounded-xl border-border/50 hover:border-primary",
                          !eventData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-4 w-4" />
                        {eventData.date
                          ? format(eventData.date, "PPP")
                          : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={eventData.date}
                        onSelect={(date) => {
                          setEventData({ ...eventData, date });
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full h-12 text-base font-medium rounded-xl gradient-primary border-0 hover:shadow-[var(--shadow-risk)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submit ? "Fetching Data..." : "Get Weather Risk Assessment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Map */}
        <div className="md:block md:pt-10">
          <MapPicker
            location={eventData.location || ""}
            onLocationChange={handleLocationChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
