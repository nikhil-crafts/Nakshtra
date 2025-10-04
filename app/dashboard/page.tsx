'use client'
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  CloudRainIcon,
  ThermometerIcon,
  WindIcon,
  SnowflakeIcon,
  TrendingUpIcon,
  MapPinIcon,
  CalendarIcon,
  SettingsIcon,
  ArrowLeftIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import type { EventData, WeatherCard, WeatherRisk } from "../../types/weather";
import { useRouter } from "next/navigation";
import CircularProgress from "@/components/circularProgress";

const Dashboard = () => {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const navigate = useRouter();

  useEffect(() => {
    const personalizedData = sessionStorage.getItem('userPreferences');

    setIsPersonalized(!!personalizedData);
  }, [navigate]);

  // Mock weather data
  const weatherCards: WeatherCard[] = [
    {
      id: 'rain',
      type: 'rain',
      title: 'Rain Risk',
      icon: 'CloudRainIcon',
      averageValue: '15mm expected',
      extremeRisk: { level: 'medium', value: 35, description: '35% chance of heavy rain' },
      details: ['Light showers likely', 'Umbrella recommended', 'Indoor backup advised']
    },
    {
      id: 'temp',
      type: 'temperature',
      title: 'Temperature',
      icon: 'ThermometerIcon',
      averageValue: '24°C / 75°F',
      extremeRisk: { level: 'low', value: 15, description: 'Low heat stress risk' },
      details: ['Comfortable range', 'Feels like 26°C', 'No extreme heat expected']
    },
    {
      id: 'wind',
      type: 'wind',
      title: 'Wind Conditions',
      icon: 'WindIcon',
      averageValue: '12 km/h',
      extremeRisk: { level: 'low', value: 10, description: 'Minimal wind disruption' },
      details: ['Light breeze', 'No gusty conditions', 'Good for outdoor setup']
    },
    {
      id: 'anomaly',
      type: 'anomaly',
      title: 'Weather Anomalies',
      icon: 'TrendingUpIcon',
      averageValue: '2°C warmer',
      extremeRisk: { level: 'low', value: 20, description: 'Slightly above average' },
      details: ['Warmer than usual', 'Normal humidity', 'Typical conditions']
    }
  ];

  const getRiskColor = (risk: WeatherRisk) => {
    switch (risk.level) {
      case 'low': return 'risk-low';
      case 'medium': return 'risk-medium';
      case 'high': return 'risk-high';
      default: return 'risk-low';
    }
  };

  const getWeatherIcon = (type: string) => {
    switch (type) {
      case 'rain': return <CloudRainIcon className="weather-icon" />;
      case 'temperature': return <ThermometerIcon className="weather-icon" />;
      case 'wind': return <WindIcon className="weather-icon" />;
      case 'snow': return <SnowflakeIcon className="weather-icon" />;
      case 'anomaly': return <TrendingUpIcon className="weather-icon" />;
      default: return <CloudRainIcon className="weather-icon" />;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate.push('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center flex-1 mx-4">
              <h1 className="text-xl font-bold text-foreground">Weather Risk Dashboard</h1>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" />
                  {eventData?.location}
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {eventData?.date ? format(eventData.date, "MMM d, yyyy") : '-'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate.push('/personalize')}
              className="rounded-full"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              {isPersonalized ? 'Adjust' : 'Personalize'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Status Badge */}
        {isPersonalized && (
          <div className="mb-6 text-center">
            <Button variant="secondary" className="bg-accent text-accent-foreground px-4 py-2 rounded-full">
              ✨ Personalized for your preferences
            </Button>
          </div>
        )}

        {/* Weather Cards */}
        <Tabs defaultValue="rain" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-auto p-1 bg-card rounded-xl">
            {weatherCards.map((card) => (
              <TabsTrigger
                key={card.id}
                value={card.id}
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                {getWeatherIcon(card.type)}
                <span className="text-xs font-medium hidden sm:block">{card.title}</span>
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
                      <span>{card.title}</span>
                    </div>

                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Average Value */}
                  <div className="flex justify-start">
                    <div style={{ padding: 20 }}>
                      <CircularProgress progress={50} size={150} strokeWidth={15}  />
                    </div>
                    <div>
                      <Button
                        className={cn(
                          getRiskColor(card.extremeRisk),
                          "px-3 py-1 text-xs font-semibold rounded-full"
                        )}
                      >
                        {card.extremeRisk.level.toUpperCase()} RISK
                      </Button>
                      <p className="text-muted-foreground">{card.averageValue}</p>
                    </div>
                  </div>

                  {/* Risk Indicator */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Risk Level</span>
                      <span className="text-sm text-muted-foreground">{card.extremeRisk.value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={cn("risk-indicator h-full", getRiskColor(card.extremeRisk))}
                        style={{ width: `${card.extremeRisk.value}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {card.extremeRisk.description}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Key Insights</h4>
                    <ul className="space-y-2">
                      {card.details.map((detail, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Personalization CTA */}
        {!isPersonalized && (
          <Card className="weather-card mt-8 bg-gradient-to-r from-accent/50 to-primary/5 border-primary/20">
            <CardContent className="text-center py-8">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Get Personalized Risk Assessment</h3>
                  <p className="text-muted-foreground mb-4">
                    Customize the risk analysis based on your comfort levels and tolerance
                  </p>
                  <Button
                    onClick={() => navigate.push('/personalize')}
                    className="gradient-primary border-0 rounded-xl px-6"
                  >
                    Personalize My Risks
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;