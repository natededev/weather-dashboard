/**
 * Weather data type definitions for type safety and future API integration
 * Structured to be compatible with OpenWeather API response format
 */

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'partly-cloudy' | 'thunderstorm' | 'fog';

export interface CurrentWeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: WeatherCondition;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  dewPoint: number;
  timestamp?: Date;
}

export interface HourlyWeatherData {
  time: string;
  temperature: number;
  icon: WeatherCondition;
  precipitation: number;
  humidity: number;
  pressure: number;
  windSpeed?: number;
  feelsLike?: number;
}

export interface DailyWeatherData {
  day: string;
  date?: string; // ISO date string for future API integration
  high: number;
  low: number;
  icon: WeatherCondition;
  precipitation: number;
  humidity?: number;
  windSpeed?: number;
  description?: string;
}

export interface WeatherData {
  current: CurrentWeatherData;
  hourly: HourlyWeatherData[];
  daily: DailyWeatherData[];
  location?: LocationData;
  lastUpdated?: string;
}

export interface LocationData {
  name: string;
  country?: string;
  region?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}

// API integration types for future use
export interface WeatherApiError {
  code: string;
  message: string;
  details?: string;
}

export interface WeatherApiResponse<T> {
  data?: T;
  error?: WeatherApiError;
  isLoading: boolean;
  lastFetched?: Date;
}

// Chart data types for future Chart.js integration
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface WeatherChartData {
  temperature: ChartDataPoint[];
  humidity: ChartDataPoint[];
  pressure: ChartDataPoint[];
  precipitation: ChartDataPoint[];
}

// UI state types
export interface WeatherUIState {
  selectedLocation: string;
  isSearching: boolean;
  isRefreshing: boolean;
  activeChartTab: 'temperature' | 'humidity' | 'pressure' | 'precipitation';
  viewMode: 'dashboard' | 'detailed' | 'charts';
}

// Search and location types
export interface LocationSuggestion {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface LocationSearchResult {
  name: string;
  region?: string;
  country: string;
  lat: number;
  lon: number;
}

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// OpenWeather API specific types
export interface OpenWeatherApiResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastApiResponse {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    visibility: number;
    pop: number;
    sys: {
      pod: string;
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}
