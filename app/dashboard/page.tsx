"use client";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  CloudRainIcon,
  ThermometerIcon,
  WindIcon,
  TrendingUpIcon,
  MapPinIcon,
  CalendarIcon,
  SettingsIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import type { EventData, WeatherCard, WeatherRisk } from "../../types/weather";
import { useRouter } from "next/navigation";
import CircularProgress from "@/components/circularProgress";

const Dashboard = () => {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [weatherCards, setWeatherCards] = useState<WeatherCard[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const navigate = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem("eventData");
    const personalizedData = sessionStorage.getItem("userPreferences");
    setIsPersonalized(!!personalizedData);

    if (storedData) {
      const parsedData: EventData = JSON.parse(storedData);
      setEventData({
        ...parsedData,
        date: parsedData.date ? new Date(parsedData.date) : undefined,
      });

      const apiResp = parsedData.apiResponse;

      if (apiResp) {
        const cards: WeatherCard[] = [
          {
            id: "rain",
            type: "rain",
            title: "Rain Risk",
            icon: "CloudRainIcon",
            averageValue: `${apiResp.average_conditions.rainfall_mm} mm`,
            extremeRisk: {
              level:
                apiResp.extreme_weather_risks.very_wet.risk_level.toLowerCase(),
              value: apiResp.extreme_weather_risks.very_wet.probability_percent,
              description: `${apiResp.extreme_weather_risks.very_wet.probability_percent}% chance of heavy rain`,
            },
          },
          {
            id: "temp",
            type: "temperature",
            title: "Temperature",
            icon: "ThermometerIcon",
            averageValue: `${apiResp.average_conditions.temperature_C}°C`,
            extremeRisk: [
              {
                type:"hot",
                level:
                  apiResp.extreme_weather_risks.very_hot.risk_level.toLowerCase(),
                value:
                  apiResp.extreme_weather_risks.very_hot.probability_percent,
                description: `${apiResp.extreme_weather_risks.very_hot.probability_percent}% chance of extreme heat`,
              },
              {
                type:'cold',
                level:
                  apiResp.extreme_weather_risks.very_cold.risk_level.toLowerCase(),
                value:
                  apiResp.extreme_weather_risks.very_cold.probability_percent,
                description: `${apiResp.extreme_weather_risks.very_cold.probability_percent}% chance of extreme cold`,
              },
            ],
          },
          {
            id: "wind",
            type: "wind",
            title: "Wind Conditions",
            icon: "WindIcon",
            averageValue: `${apiResp.average_conditions.wind_speed_kmh} km/h`,
            extremeRisk: {
              level:
                apiResp.extreme_weather_risks.very_windy.risk_level.toLowerCase(),
              value:
                apiResp.extreme_weather_risks.very_windy.probability_percent,
              description: `${apiResp.extreme_weather_risks.very_windy.probability_percent}% chance of strong winds`,
            },
          },
        ];

        setWeatherCards(cards);
      }
    }
  }, [navigate]);

  const getRiskColor = (risk: WeatherRisk) => {
    switch (risk.level) {
      case "low":
        return "risk-low";
      case "medium":
        return "risk-medium";
      case "high":
        return "risk-high";
      case "very high":
        return "risk-high";
      default:
        return "risk-low";
    }
  };

  const getWeatherIcon = (type: string) => {
    switch (type) {
      case "rain":
        return <CloudRainIcon className="weather-icon" />;
      case "temperature":
        return <ThermometerIcon className="weather-icon" />;
      case "wind":
        return <WindIcon className="weather-icon" />;
      case "anomaly":
        return <TrendingUpIcon className="weather-icon" />;
      default:
        return <CloudRainIcon className="weather-icon" />;
    }
  };

  if (!eventData || weatherCards.length === 0) {
    return <CircularProgress progress={50} size={150} strokeWidth={15} />; // loading state
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate.push("/")}
            className="text-muted-foreground hover:text-foreground flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-xl font-bold text-foreground">
              Weather Risk Dashboard
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-3 h-3" />
                {eventData?.location}
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {eventData?.date ? format(eventData.date, "MMM d, yyyy") : "-"}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate.push("/personalize")}
            className="rounded-full flex items-center"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            {isPersonalized ? "Adjust" : "Personalize"}
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        {isPersonalized && (
          <div className="mb-6 text-center">
            <Button
              variant="secondary"
              className="bg-accent text-accent-foreground px-4 py-2 rounded-full"
            >
              ✨ Personalized for your preferences
            </Button>
          </div>
        )}

        <Tabs defaultValue="rain" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1 bg-card rounded-xl">
            {weatherCards.map((card) => (
              <TabsTrigger
                key={card.id}
                value={card.id}
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                {getWeatherIcon(card.type)}
                <span className="text-xs font-medium hidden sm:block">
                  {card.title}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {weatherCards.map((card) => (
            <TabsContent key={card.id} value={card.id} className="mt-0">
              <Card className="weather-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(card.type)}
                      <span className="text-2xl">{card.title}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="flex flex-col items-center">
                      {Array.isArray(card.extremeRisk) ? (
                        // Multiple risks (temperature hot & cold)
                        <div className="flex flex-row justify-center items-start gap-18">
                          {card.extremeRisk.map((risk, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center space-y-2"
                            >
                              <h3>{risk.type}</h3>
                              <CircularProgress
                                progress={risk.value}
                                size={100}
                                strokeWidth={12}
                              />
                              <Button
                                className={cn(
                                  getRiskColor(risk),
                                  "px-3 py-1 text-sm w-30 font-semibold rounded-full"
                                )}
                              >
                                {risk.level.toUpperCase()}
                              </Button>
                              <p className="text-sm text-muted-foreground text-center">
                                {risk.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Single risk (rain, wind, etc.)
                        <div className="flex flex-col items-center space-y-2">
                          <CircularProgress
                            progress={card.extremeRisk.value}
                            size={150}
                            strokeWidth={15}
                          />
                          <Button
                            className={cn(
                              getRiskColor(card.extremeRisk),
                              "px-3 py-1 text-xl w-50 font-semibold rounded-full"
                            )}
                          >
                            {card.extremeRisk.level.toUpperCase()}
                          </Button>
                          <p className="text-sm text-center font-bold">
                            {card.extremeRisk.description}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Card className="shadow-2xs">
                        <CardTitle className="flex justify-end flex-col space-y-5">
                        <h1 className="text-2xl text-center">
                          Expected {card.type}
                        </h1>
                        <p className="text-2xl text-bold font-extrabold text-center">
                          {card.averageValue}
                        </p>
                      </CardTitle>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
