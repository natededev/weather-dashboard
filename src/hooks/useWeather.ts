import { useState, useCallback, useEffect } from 'react';
import { WeatherData, LocationData, WeatherApiResponse } from '@/types/weather';
import { mockWeatherData } from '@/lib/mockData';
import { weatherService, locationService, weatherUtils } from '@/lib/weatherApi';

/**
 * Custom hook for managing weather data
 * Designed to easily switch between mock data and real API calls
 */
export function useWeatherData(initialLocation?: string) {
  const [weatherData, setWeatherData] = useState<WeatherData>(mockWeatherData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Helper: parse location string (city or "lat,lon")
  const parseLocation = async (location?: string) => {
    if (!location) return null;
    // If location is in "lat,lon" format
    if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(location)) {
      const [lat, lon] = location.split(',').map(Number);
      return { lat, lon };
    }
    // Otherwise, use geocoding
    const results = await locationService.searchLocations(location, 1);
    if (results && results.length > 0) {
      return { lat: results[0].lat, lon: results[0].lon };
    }
    return null;
  };

  const fetchWeatherData = useCallback(async (location?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let coords = null;
      if (location) {
        coords = await parseLocation(location);
      }
      let data: WeatherData;
      if (weatherUtils.isAPIConfigured() && coords && coords.lat && coords.lon) {
        // Fetch current weather and forecast, then merge
        const [current, forecast] = await Promise.all([
          weatherService.getCurrentWeather(coords.lat, coords.lon),
          weatherService.getForecast(coords.lat, coords.lon),
        ]);
        data = {
          ...current,
          hourly: forecast.hourly,
          daily: forecast.daily,
        };
      } else {
        // Fallback to mock data
        data = mockWeatherData;
      }
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Weather data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshWeatherData = useCallback(() => {
    return fetchWeatherData();
  }, [fetchWeatherData]);

  // Initial data fetch
  useEffect(() => {
    if (initialLocation) {
      fetchWeatherData(initialLocation);
    }
  }, [fetchWeatherData, initialLocation]);

  return {
    weatherData,
    isLoading,
    error,
    lastUpdated,
    fetchWeatherData,
    refreshWeatherData,
  };
}

/**
 * Hook for managing location search and geolocation
 */
export function useLocationSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);

  // Use OpenWeather geocoding API for real location suggestions
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      // Use locationService from weatherApi
      const results = await locationService.searchLocations(query, 5);
      // Map to LocationData with proper formatting
      const mapped = results.map(loc => ({
        name: loc.name + (loc.state ? `, ${loc.state}` : "") + (loc.country ? `, ${loc.country}` : ""),
        country: loc.country,
        region: loc.state,
        lat: loc.lat,
        lon: loc.lon,
        // Store original data for coordinates
        originalLocation: loc,
      }));
      setSearchResults(mapped);
    } catch (err) {
      console.error('Location search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    searchLocations,
    getCurrentLocation,
  };
}

/**
 * Hook for managing responsive design and screen size detection
 */
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsPortrait(height > width);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    window.addEventListener('orientationchange', checkViewport);

    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', checkViewport);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isPortrait,
    isLandscape: !isPortrait,
  };
}
