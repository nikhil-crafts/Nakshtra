export interface EventData {
  location: string;
  date?: Date;
  lat?: number;
  lng?: number;
  thresholds?: {
    hot?: number;
    cold?: number;
    windy?: number;
    rain?: number;
  };
  apiResponse?: any; // Add this line
}

export interface WeatherRisk {
  level: 'low' | 'medium' | 'high'| 'very high';
  value: number;
  description: string;
  type?: string;
}

export interface WeatherCard {
  id: string;
  type: 'rain' | 'temperature' | 'wind' | 'snow' | 'anomaly';
  title: string;
  icon: string;
  averageValue: string;
  extremeRisk: WeatherRisk | WeatherRisk[];
}

export interface UserPreferences {
  maxComfortableTemp: number;
  minComfortableTemp: number;
  maxWindTolerance: number;
  rainTolerance: number;
}