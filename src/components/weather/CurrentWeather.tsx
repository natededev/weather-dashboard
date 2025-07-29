import React, { memo } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, CloudDrizzle, Zap, CloudLightning, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentWeatherData, WeatherCondition } from "@/types/weather";
import { formatTemperature, formatWind, formatPressure } from "@/lib/weatherUtils";
import { useResponsive } from "@/hooks/useWeather";

interface CurrentWeatherProps {
  data: CurrentWeatherData;
  isLoading: boolean;
}

const weatherIcons: Record<WeatherCondition, LucideIcon> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  windy: Wind,
  'partly-cloudy': CloudDrizzle,
  thunderstorm: CloudLightning,
  fog: Cloud,
};

function CurrentWeather({ data, isLoading }: CurrentWeatherProps) {
  const { isMobile, isPortrait } = useResponsive();

  if (isLoading) {
    return (
      <Card className="glass-enhanced border-white/20 p-4 md:p-6 lg:p-8 no-overlap min-h-[200px]">
        <div className="space-y-4">
          <Skeleton className="h-6 md:h-8 w-32 md:w-48 bg-white/30" />
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Skeleton className="h-16 w-16 md:h-20 md:w-20 bg-white/30 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-12 md:h-16 lg:h-20 w-24 md:w-32 bg-white/30" />
              <Skeleton className="h-4 md:h-6 w-32 bg-white/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20 bg-white/30" />
                <Skeleton className="h-5 md:h-6 w-16 bg-white/30" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const IconComponent = weatherIcons[data.icon] || Sun;

  return (
    <Card className="glass-enhanced border-white/20 p-4 md:p-6 lg:p-8 no-overlap min-h-[200px]">
      <div className={`flex ${
        isMobile && isPortrait 
          ? 'flex-col gap-4' 
          : 'flex-col sm:flex-row items-start sm:items-center justify-between gap-6'
      }`}>
        
        {/* Main Weather Display */}
        <div className="space-y-2 md:space-y-4">
          <div className="flex items-center gap-3 md:gap-4">
            <IconComponent 
              className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 text-black drop-shadow-lg flex-shrink-0" 
              aria-hidden={true}
            />
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-black leading-none">
                {formatTemperature(data.temperature, 'C')}
              </h2>
              <p className="text-black/90 text-base md:text-lg capitalize mt-1">
                {data.condition}
              </p>
            </div>
          </div>
          <p className="text-black/70 capitalize text-sm md:text-base max-w-md">
            {data.description}
          </p>
        </div>

        {/* Weather Details Grid */}
        <div className={`grid grid-cols-2 gap-3 md:gap-4 text-sm ${
          isMobile && isPortrait ? 'w-full' : 'min-w-fit'
        }`}>
          <div className="space-y-1">
            <p className="text-black/70 text-xs md:text-sm">Feels like</p>
            <p className="text-base md:text-lg font-medium text-black/90">
              {formatTemperature(data.feelsLike, 'C')}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-black/70 text-xs md:text-sm">Humidity</p>
            <p className="text-base md:text-lg font-medium text-black/90">{data.humidity}%</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-black/70 text-xs md:text-sm">Wind</p>
            <p className="text-base md:text-lg font-medium text-black/90">
              {formatWind(data.windSpeed, data.windDirection)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-black/70 text-xs md:text-sm">Pressure</p>
            <p className="text-base md:text-lg font-medium text-black/90">
              {formatPressure(data.pressure)}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Weather Info - Mobile Only */}
      {isMobile && isPortrait && (
        <div className="mt-4 pt-4 border-t border-white/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-black/70">Visibility</p>
              <p className="text-sm font-medium text-black/90">{data.visibility} mi</p>
            </div>
            <div>
              <p className="text-xs text-black/70">UV Index</p>
              <p className="text-sm font-medium text-black/90">{data.uvIndex}</p>
            </div>
            <div>
              <p className="text-xs text-black/70">Dew Point</p>
              <p className="text-sm font-medium text-black/90">{formatTemperature(data.dewPoint, 'C')}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default memo(CurrentWeather);
