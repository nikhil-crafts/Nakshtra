export interface EventData {
  location: string;
  date: Date;
  name?: string;
}

export interface WeatherRisk {
  level: 'low' | 'medium' | 'high';
  value: number;
  description: string;
}

export interface WeatherCard {
  id: string;
  type: 'rain' | 'temperature' | 'wind' | 'snow' | 'anomaly';
  title: string;
  icon: string;
  averageValue: string;
  extremeRisk: WeatherRisk;
  details: string[];
}

export interface UserPreferences {
  maxComfortableTemp: number;
  minComfortableTemp: number;
  maxWindTolerance: number;
  rainTolerance: number;
  snowTolerance: number;
}