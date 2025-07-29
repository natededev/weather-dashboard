import { useState, lazy, Suspense } from "react";
import { Search, MapPin, RefreshCw, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import CurrentWeather from "./CurrentWeather";
import HourlyForecast from "./HourlyForecast";
import WeeklyForecast from "./WeeklyForecast";
import WeatherDetails from "./WeatherDetails";
import { useWeatherData, useLocationSearch, useResponsive } from "@/hooks/useWeather";
import { locationService } from "@/lib/weatherApi";
import { getWeatherConditionInfo, getRelativeTime } from "@/lib/weatherUtils";

// Lazy load heavy chart component
const WeatherCharts = lazy(() => import("./WeatherCharts").then(module => ({ default: module.WeatherCharts })));

export function WeatherDashboard() {
  // Load last location from localStorage or default to Asaba, Nigeria  
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('weather-last-location') || "Asaba, Delta State, Nigeria";
  });
  const { isMobile, isTablet, isPortrait } = useResponsive();
  const { toast } = useToast();
  
  // Weather data hook
  const { 
    weatherData, 
    isLoading, 
    error, 
    lastUpdated, 
    fetchWeatherData, 
    refreshWeatherData 
  } = useWeatherData(location);

  // Location search hook
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    searchLocations,
    getCurrentLocation,
  } = useLocationSearch();

  const [geoError, setGeoError] = useState<string | null>(null);

  // Define a type for selectedLocation
  type LocationType = {
    name: string;
    lat?: number;
    lon?: number;
    originalLocation?: { lat: number; lon: number };
  };
  const handleLocationSelect = async (selectedLocation: LocationType) => {
    try {
      const coords = selectedLocation.originalLocation 
        ? `${selectedLocation.originalLocation.lat},${selectedLocation.originalLocation.lon}`
        : `${selectedLocation.lat},${selectedLocation.lon}`;
      
      await fetchWeatherData(coords);
      setLocation(selectedLocation.name);
      localStorage.setItem('weather-last-location', selectedLocation.name);
      setSearchQuery("");
    } catch (err) {
      console.error('Search failed:', err);
      toast({
        title: "Location not found",
        description: "Please try searching for a valid location.",
        variant: "destructive"
      });
    }
  };

  const handleDirectSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const attempts = [];
      const original = searchQuery.trim();
      attempts.push(original);
      // Try with comma between words
      attempts.push(original.replace(/\s+/g, ', '));
      // Try with spaces between lowercase-uppercase or letter-number transitions (e.g., newyork -> new york)
      attempts.push(original.replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/([0-9])([a-zA-Z])/g, '$1 $2'));
      // Try with both spaces and commas
      attempts.push(original.replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/([0-9])([a-zA-Z])/g, '$1 $2').replace(/\s+/g, ', '));

      let found = false;
      let results = [];
      for (const attempt of attempts) {
        if (attempt && attempt !== '' && attempt !== original) {
          results = await locationService.searchLocations(attempt, 1);
        } else {
          results = await locationService.searchLocations(attempt, 1);
        }
        if (results && results.length > 0) {
          found = true;
          break;
        }
      }
      if (found && results && results.length > 0) {
        const loc = results[0];
        const formatted = [loc.name, loc.state, loc.country].filter(Boolean).join(", ");
        const coords = `${loc.lat},${loc.lon}`;
        await fetchWeatherData(coords);
        setLocation(formatted);
        localStorage.setItem('weather-last-location', formatted);
        setSearchQuery("");
      } else {
        toast({
          title: "Location not found",
          description: `"${searchQuery}" is not a valid location. Please try another search.`,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Search failed:', err);
      toast({
        title: "Location not found",
        description: `"${searchQuery}" is not a valid location. Please try another search.`,
        variant: "destructive"
      });
    }
  };

  const handleGetCurrentLocation = async () => {
    setGeoError(null);
    try {
      const position = await getCurrentLocation();
      const coords = `${position.coords.latitude.toFixed(2)},${position.coords.longitude.toFixed(2)}`;
      setLocation(coords);
      localStorage.setItem('weather-last-location', coords);
      await fetchWeatherData(coords);
    } catch (err: unknown) {
      let msg = 'Geolocation failed.';
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 1) {
        msg = 'Location access denied. Please allow location permissions in your browser.';
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        msg = (err as { message: string }).message;
      }
      setGeoError(msg);
      console.error('Geolocation failed:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDirectSearch();
    }
  };

  const conditionInfo = getWeatherConditionInfo(weatherData.current.icon, weatherData.current.temperature);

  return (
    <div className={`min-h-screen landscape-container ${conditionInfo.gradient}`}>
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6 layout-stable">
        {/* Header with Search - Improved mobile layout */}
        <Card className="glass-enhanced border-white/20 p-4 md:p-6 no-overlap">
          <div className="flex flex-col gap-4">
            {/* Location and Status Row */}
            {geoError && (
              <div className="bg-red-100 text-red-700 rounded p-2 text-sm mb-2">
                {geoError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center justify-between">
              <div className="flex items-center gap-2 text-black min-w-0">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-semibold truncate">{location}</h1>
                  {lastUpdated && (
                    <p className="text-xs text-black/60">
                      Updated {getRelativeTime(lastUpdated)}
                    </p>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="text-red-300 text-sm bg-red-500/20 px-3 py-2 rounded-md backdrop-blur-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Search Controls - Simple */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/60" />
                <label htmlFor="weather-search" className="sr-only">Search location</label>
                <Input
                  id="weather-search"
                  name="weather-search"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleDirectSearch()}
                  disabled={isLoading}
                  className="pl-10 bg-white/10 border-white/20 text-black placeholder:text-black/60 focus:bg-white/20 focus:border-white/40"
                  autoComplete="off"
                />
              </div>
              
              <Button 
                onClick={handleDirectSearch}
                disabled={isLoading || isSearching || !searchQuery.trim()}
                variant="secondary"
                size={isMobile ? "sm" : "default"}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-black flex-shrink-0"
                aria-label="Search location"
              >
                <Search className="h-4 w-4" />
                {!isMobile && <span className="ml-2">Search</span>}
              </Button>

              <Button 
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                variant="secondary"
                size={isMobile ? "sm" : "default"}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-black flex-shrink-0"
                aria-label="Use current location"
              >
                <Navigation className="h-4 w-4" />
                {!isMobile && <span className="ml-2">Location</span>}
              </Button>
              
              <Button 
                onClick={refreshWeatherData}
                disabled={isLoading}
                variant="secondary"
                size={isMobile ? "sm" : "default"}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-black flex-shrink-0"
                aria-label="Refresh weather data"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {!isMobile && <span className="ml-2">Refresh</span>}
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Weather Content - Improved Responsive Grid */}
        <div className={`grid gap-4 md:gap-6 landscape-grid no-overlap ${
          isMobile && isPortrait 
            ? 'grid-cols-1' 
            : isMobile && !isPortrait
              ? 'grid-cols-2 lg:grid-cols-3' // Mobile landscape
              : isTablet 
                ? 'grid-cols-2 xl:grid-cols-3' // Tablet
                : 'grid-cols-1 lg:grid-cols-3 xl:grid-cols-4' // Desktop
        }`}>
          
          {/* Main Weather Section */}
          <div className={`space-y-4 md:space-y-6 layout-stable ${
            isMobile && isPortrait 
              ? 'col-span-1' 
              : isMobile && !isPortrait
                ? 'col-span-2' // Mobile landscape - take 2 columns
                : isTablet 
                  ? 'col-span-2' // Tablet - take 2 columns
                  : 'col-span-1 lg:col-span-2 xl:col-span-3' // Desktop - take 3 columns
          }`}>
            <CurrentWeather data={weatherData.current} isLoading={isLoading} />
            <HourlyForecast data={weatherData.hourly} isLoading={isLoading} />
            
            {/* Charts - Conditional rendering based on screen size and orientation */}
            {((!isMobile && !isPortrait) || (isMobile && !isPortrait)) && (
              <Suspense fallback={
                <Card className="glass-enhanced border-white/20 p-4 md:p-6 min-h-[400px]">
                  <Skeleton className="h-6 w-32 bg-white/20 mb-4" />
                  <Skeleton className="h-80 w-full bg-white/20" />
                </Card>
              }>
                <WeatherCharts data={weatherData} isLoading={isLoading} />
              </Suspense>
            )}
          </div>

          {/* Sidebar with Details and Forecast */}
          <div className={`space-y-4 md:space-y-6 layout-stable ${
            isMobile && isPortrait 
              ? 'col-span-1' 
              : isMobile && !isPortrait
                ? 'col-span-2 row-start-2' // Mobile landscape - new row
                : isTablet 
                  ? 'col-span-2 row-start-2' // Tablet - new row  
                  : 'col-span-1' // Desktop - sidebar
          }`}>
            <div className={`grid gap-4 md:gap-6 no-overlap ${
              isMobile && !isPortrait 
                ? 'grid-cols-2' // Mobile landscape - side by side
                : isTablet
                  ? 'grid-cols-2' // Tablet - side by side
                  : 'grid-cols-1' // Portrait or desktop - stacked
            }`}>
              <WeatherDetails data={weatherData.current} isLoading={isLoading} />
              <WeeklyForecast data={weatherData.daily} isLoading={isLoading} />
            </div>
          </div>

          {/* Charts for mobile portrait - moved to bottom for better UX */}
          {isMobile && isPortrait && (
            <div className="col-span-1 order-last layout-stable">
              <Suspense fallback={
                <Card className="glass-enhanced border-white/20 p-4 md:p-6 min-h-[400px]">
                  <Skeleton className="h-6 w-32 bg-white/20 mb-4" />
                  <Skeleton className="h-80 w-full bg-white/20" />
                </Card>
              }>
                <WeatherCharts data={weatherData} isLoading={isLoading} />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}