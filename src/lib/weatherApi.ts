import { WeatherData, LocationSuggestion, OpenWeatherApiResponse, ForecastApiResponse, WeatherCondition, DailyWeatherData } from '@/types/weather';
import { mockWeatherData } from '@/lib/mockData';

// Configuration
const API_CONFIG = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  GEO_URL: 'https://api.openweathermap.org/geo/1.0',
  API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || '',
  DEFAULT_UNITS: 'metric' as const,
  DEFAULT_LANG: 'en' as const,
};

// API Error handling
export class WeatherAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiCode?: string
  ) {
    super(message);
    this.name = 'WeatherAPIError';
  }
}

// HTTP client with error handling
class APIClient {
  private async request<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }
        
        throw new WeatherAPIError(errorMessage, response.status);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof WeatherAPIError) {
        throw error;
      }
      
      // Network or other errors
      throw new WeatherAPIError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }

  async get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(endpoint);
    
    // Add API key
    if (API_CONFIG.API_KEY) {
      params.appid = API_CONFIG.API_KEY;
    }
    
    // Add parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    
    return this.request<T>(url.toString());
  }
}

const apiClient = new APIClient();

// Location services
export const locationService = {
  /**
   * Search for locations by name
   */
  async searchLocations(query: string, limit = 5): Promise<LocationSuggestion[]> {
    if (!query.trim()) return [];
    
    try {
      const results = await apiClient.get<Array<{
        name: string;
        country: string;
        state?: string;
        lat: number;
        lon: number;
      }>>(`${API_CONFIG.GEO_URL}/direct`, {
        q: query,
        limit,
      });
      
      return results.map((location, index) => ({
        id: `${location.lat}-${location.lon}-${index}`,
        name: location.name,
        country: location.country,
        state: location.state,
        lat: location.lat,
        lon: location.lon,
      }));
    } catch (error) {
      console.error('Location search failed:', error);
      // Return mock data for development
      return getMockLocationSuggestions(query);
    }
  },

  /**
   * Get location details by coordinates
   */
  async getLocationByCoords(lat: number, lon: number): Promise<LocationSuggestion | null> {
    try {
      const results = await apiClient.get<Array<{
        name: string;
        country: string;
        state?: string;
        lat: number;
        lon: number;
      }>>(`${API_CONFIG.GEO_URL}/reverse`, {
        lat,
        lon,
        limit: 1,
      });
      
      if (results.length === 0) return null;
      
      const location = results[0];
      return {
        id: `${location.lat}-${location.lon}`,
        name: location.name,
        country: location.country,
        state: location.state,
        lat: location.lat,
        lon: location.lon,
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  },

  /**
   * Get current position using browser geolocation
   */
  getCurrentPosition(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          let message = 'Unable to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  },
};

// Weather services
export const weatherService = {
  /**
   * Get current weather by coordinates
   */
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const data = await apiClient.get<OpenWeatherApiResponse>(`${API_CONFIG.BASE_URL}/weather`, {
        lat,
        lon,
        units: API_CONFIG.DEFAULT_UNITS,
        lang: API_CONFIG.DEFAULT_LANG,
      });
      
      return transformWeatherData(data);
    } catch (error) {
      console.error('Current weather fetch failed:', error);
      // Return mock data for development
      return getMockWeatherData();
    }
  },

  /**
   * Get weather forecast by coordinates
   */
  async getForecast(lat: number, lon: number): Promise<WeatherData> {
    try {
      const data = await apiClient.get<ForecastApiResponse>(`${API_CONFIG.BASE_URL}/forecast`, {
        lat,
        lon,
        units: API_CONFIG.DEFAULT_UNITS,
        lang: API_CONFIG.DEFAULT_LANG,
      });
      
      return transformForecastData(data);
    } catch (error) {
      console.error('Forecast fetch failed:', error);
      // Return mock data for development
      return getMockWeatherData();
    }
  },

  /**
   * Get weather by location name
   */
  async getWeatherByLocation(location: LocationSuggestion): Promise<WeatherData> {
    return this.getCurrentWeather(location.lat, location.lon);
  },
};

// Data transformation utilities
function transformWeatherData(apiData: OpenWeatherApiResponse): WeatherData {
  // Map OpenWeather icon codes to our weather conditions
  const iconMapping: Record<string, WeatherCondition> = {
    '01d': 'sunny',
    '01n': 'sunny',
    '02d': 'partly-cloudy',
    '02n': 'partly-cloudy',
    '03d': 'cloudy',
    '03n': 'cloudy',
    '04d': 'cloudy',
    '04n': 'cloudy',
    '09d': 'rainy',
    '09n': 'rainy',
    '10d': 'rainy',
    '10n': 'rainy',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'snowy',
    '13n': 'snowy',
    '50d': 'fog',
    '50n': 'fog',
  };

  // Convert wind direction from degrees to compass direction
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  // Transform OpenWeather API response to our internal format
  return {
    location: {
      name: apiData.name,
      country: apiData.sys.country,
      lat: apiData.coord.lat,
      lon: apiData.coord.lon,
    },
    current: {
      temperature: Math.round(apiData.main.temp),
      feelsLike: Math.round(apiData.main.feels_like),
      condition: apiData.weather[0].main,
      description: apiData.weather[0].description,
      icon: iconMapping[apiData.weather[0].icon] || 'sunny',
      humidity: apiData.main.humidity,
      windSpeed: apiData.wind.speed,
      windDirection: getWindDirection(apiData.wind.deg || 0),
      pressure: apiData.main.pressure,
      visibility: apiData.visibility ? apiData.visibility / 1000 : 10,
      uvIndex: 0, // Not available in current weather endpoint
      sunrise: new Date(apiData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(apiData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dewPoint: 0, // Would need to be calculated or from different endpoint
      timestamp: new Date(apiData.dt * 1000),
    },
    hourly: [], // Would be populated from forecast endpoint
    daily: [],  // Would be populated from forecast endpoint
  };
}

function transformForecastData(apiData: ForecastApiResponse): WeatherData {
  // Map OpenWeather icon codes to our weather conditions
  const iconMapping: Record<string, WeatherCondition> = {
    '01d': 'sunny',
    '01n': 'sunny',
    '02d': 'partly-cloudy',
    '02n': 'partly-cloudy',
    '03d': 'cloudy',
    '03n': 'cloudy',
    '04d': 'cloudy',
    '04n': 'cloudy',
    '09d': 'rainy',
    '09n': 'rainy',
    '10d': 'rainy',
    '10n': 'rainy',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'snowy',
    '13n': 'snowy',
    '50d': 'fog',
    '50n': 'fog',
  };

  // 24-hour forecast (8 x 3-hour intervals)
  const now = Date.now();
  const hourly = apiData.list.slice(0, 8).map((item) => {
    const date = new Date(item.dt * 1000);
    return {
      time: date.getHours() === new Date(now).getHours() ? 'Now' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: Math.round(item.main.temp),
      icon: iconMapping[item.weather[0].icon] || 'sunny',
      precipitation: Math.round((item.pop || 0) * 100),
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      windSpeed: item.wind.speed,
      feelsLike: Math.round(item.main.feels_like),
    };
  });

  // 7-day forecast: group by day, take max/min temps, etc.
  const daysMap: Record<string, DailyWeatherData> = {};
  apiData.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString(undefined, { weekday: 'short' });
    if (!daysMap[day]) {
      daysMap[day] = {
        day,
        high: item.main.temp_max,
        low: item.main.temp_min,
        icon: iconMapping[item.weather[0].icon] || 'sunny',
        precipitation: Math.round((item.pop || 0) * 100),
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        description: item.weather[0].description,
        date: date.toISOString(),
      };
    } else {
      daysMap[day].high = Math.max(daysMap[day].high, item.main.temp_max);
      daysMap[day].low = Math.min(daysMap[day].low, item.main.temp_min);
      // Use the icon/description from the item with the highest pop (precipitation probability)
      if ((item.pop || 0) > (daysMap[day].precipitation || 0)) {
        daysMap[day].icon = iconMapping[item.weather[0].icon] || 'sunny';
        daysMap[day].description = item.weather[0].description;
        daysMap[day].precipitation = Math.round((item.pop || 0) * 100);
      }
    }
  });
  const daily = Object.values(daysMap).slice(0, 7);

  return {
    current: {
      temperature: Math.round(apiData.list[0].main.temp),
      condition: apiData.list[0].weather[0].main,
      description: apiData.list[0].weather[0].description,
      icon: iconMapping[apiData.list[0].weather[0].icon] || 'sunny',
      feelsLike: Math.round(apiData.list[0].main.feels_like),
      humidity: apiData.list[0].main.humidity,
      windSpeed: apiData.list[0].wind.speed,
      windDirection: '',
      pressure: apiData.list[0].main.pressure,
      visibility: apiData.list[0].visibility ? apiData.list[0].visibility / 1000 : 10,
      uvIndex: 0,
      sunrise: new Date(apiData.city.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(apiData.city.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dewPoint: 0,
      timestamp: new Date(apiData.list[0].dt * 1000),
    },
    hourly,
    daily,
    location: {
      name: apiData.city.name,
      country: apiData.city.country,
      lat: apiData.city.coord.lat,
      lon: apiData.city.coord.lon,
      timezone: String(apiData.city.timezone),
    },
    lastUpdated: new Date().toISOString(),
  };
}

// Mock data for development (remove when API is ready)
function getMockWeatherData(): WeatherData {
  // Use the imported mock data
  return mockWeatherData;
}

function getMockLocationSuggestions(query: string): LocationSuggestion[] {
  const mockLocations: LocationSuggestion[] = [
    { id: '1', name: 'New York', country: 'US', state: 'NY', lat: 40.7128, lon: -74.0060 },
    { id: '2', name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
    { id: '3', name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
    { id: '4', name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
    { id: '5', name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
  ];
  
  return mockLocations.filter(location =>
    location.name.toLowerCase().includes(query.toLowerCase())
  );
}

// Utility functions
export const weatherUtils = {
  /**
   * Check if API key is configured
   */
  isAPIConfigured(): boolean {
    return Boolean(API_CONFIG.API_KEY);
  },

  /**
   * Get API status message
   */
  getAPIStatus(): string {
    if (!this.isAPIConfigured()) {
      return 'API key not configured - using mock data';
    }
    return 'API ready';
  },
};

// Export API configuration for use in other parts of the app
export { API_CONFIG };
