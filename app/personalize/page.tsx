"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  ThermometerIcon,
  WindIcon,
  CloudRainIcon,
  SaveIcon,
} from "lucide-react";
import type { UserPreferences } from "@/types/weather";
import { useRouter } from "next/navigation";

const Personalize = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    maxComfortableTemp: 28,
    minComfortableTemp: 15,
    maxWindTolerance: 25,
    rainTolerance: 20,
  });
  const navigate = useRouter();

  useEffect(() => {
    // Load existing preferences if available
    const stored = sessionStorage.getItem("userPreferences");
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    sessionStorage.setItem("userPreferences", JSON.stringify(preferences));

    navigate.push("/dashboard");
  };

  const sliderConfigs = [
    {
      id: "maxComfortableTemp",
      title: "Maximum Comfortable Temperature",
      description: "Highest temperature you find comfortable",
      icon: <ThermometerIcon className="w-5 h-5 text-weather-temp" />,
      value: preferences.maxComfortableTemp,
      min: 20,
      max: 45,
      step: 1,
      unit: "°C",
      color: "bg-weather-temp",
    },
    {
      id: "minComfortableTemp",
      title: "Minimum Comfortable Temperature",
      description: "Lowest temperature you find comfortable",
      icon: <ThermometerIcon className="w-5 h-5 text-primary" />,
      value: preferences.minComfortableTemp,
      min: -5,
      max: 25,
      step: 1,
      unit: "°C",
      color: "bg-primary",
    },
    {
      id: "maxWindTolerance",
      title: "Wind Tolerance",
      description: "Maximum wind speed you can tolerate",
      icon: <WindIcon className="w-5 h-5 text-weather-wind" />,
      value: preferences.maxWindTolerance,
      min: 10,
      max: 60,
      step: 5,
      unit: " km/h",
      color: "bg-weather-wind",
    },
    {
      id: "rainTolerance",
      title: "Rain Tolerance",
      description: "Maximum rainfall you can handle",
      icon: <CloudRainIcon className="w-5 h-5 text-weather-rain" />,
      value: preferences.rainTolerance,
      min: 0,
      max: 50,
      step: 5,
      unit: "mm",
      color: "bg-weather-rain",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10">
        <img
          src="/space.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Header */}
      <div
        className="
    backdrop-blur-2xl
    bg-white/10
    shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
   0 sticky top-0 z-50 "
      >
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-white">Personalize Risks</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6">
        <Card
          className="weather-card backdrop-blur-2xl
          bg-white/10
          shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] mb-6 text-white"
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Customize Your Risk Assessment
            </CardTitle>
            <CardDescription className="text-base text-white">
              Adjust these settings to get weather risk assessments tailored to
              your comfort levels and tolerance
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {sliderConfigs.map((config) => (
            <Card key={config.id} className="weather-card backdrop-blur-2xl
          bg-white/10
          shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] text-white">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-white">{config.icon}</div>
                  <div className="flex-1">
                    <label className="text-base font-semibold text-white">
                      {config.title}
                    </label>
                    <p className="text-sm text-white mt-1">
                      {config.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">
                      {config.value}
                      {config.unit}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <Slider
                    value={[config.value]}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({
                        ...prev,
                        [config.id]: value[0],
                      }))
                    }
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    className="w-full "
                  />
                  <div className="flex justify-between text-xs text-white">
                    <span>
                      {config.min}
                      {config.unit}
                    </span>
                    <span>
                      {config.max}
                      {config.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleSave}
            size="lg"
            className="gradient-primary border-0 rounded-xl px-8 h-12 text-base font-medium hover:shadow-[var(--shadow-risk)] transition-all duration-300"
          >
            <SaveIcon className="w-5 h-5 mr-2" />
            Save Preferences
          </Button>
        </div>

        <p className="text-center text-sm text-white mt-4">
          Your preferences are saved locally and will personalize your risk
          assessments
        </p>
      </div>
    </div>
  );
};

export default Personalize;
