import React, { memo } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, Wind, CloudDrizzle, CloudLightning, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HourlyWeatherData, WeatherCondition } from "@/types/weather";
import { useResponsive } from "@/hooks/useWeather";

interface HourlyForecastProps {
  data: HourlyWeatherData[];
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

function HourlyForecast({ data, isLoading }: HourlyForecastProps) {
  const { isPortrait, isLandscape } = useResponsive();
  if (isLoading) {
    return (
      <Card className="glass-enhanced border-white/20 p-4 md:p-6 min-h-[260px]">
        <Skeleton className="h-5 md:h-6 w-32 md:w-40 bg-white/20 mb-4" />
        <div className="flex gap-4 md:gap-6 px-2 min-w-max">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 md:gap-4 min-w-[65px] md:min-w-[75px]">
              <Skeleton className="h-5 md:h-6 w-16 md:w-20 bg-white/20" />
              <Skeleton className="h-7 md:h-9 w-7 md:w-9 bg-white/20 rounded-full" />
              <Skeleton className="h-6 md:h-8 w-12 md:w-16 bg-white/20" />
              <Skeleton className="h-4 w-8 bg-white/20" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Show 6 hours at a time, but keep full 24-hour data for API integration
  const displayData = data.slice(0, 6);

  return (
    <Card className="glass-enhanced border-white/20 p-4 md:p-6 min-h-[260px]">
      <h3 className="text-base md:text-lg font-semibold text-black mb-6 text-center drop-shadow-sm">
        24-Hour Forecast
      </h3>
      <div className={`w-full pb-2 ${isPortrait ? 'overflow-x-auto' : ''}`}>
        <div className={`flex gap-4 md:gap-6 px-2 min-w-max ${isLandscape ? 'justify-center' : ''}`}>
          {displayData.map((hour, index) => {
            const IconComponent = weatherIcons[hour.icon] || Sun;
            const isCurrentHour = index === 0;
            
            return (
              <div
                key={index}
                className={`flex flex-col items-center gap-3 md:gap-4 min-w-[65px] md:min-w-[75px] 
                           text-center ${
                  isCurrentHour 
                    ? 'bg-gradient-to-br from-white/50 to-white/30 rounded-xl px-3 py-4 shadow-lg backdrop-blur-sm border border-white/40' 
                    : 'hover:bg-white/20 rounded-xl px-3 py-3'
                }`}
              >
                <p className="text-xs md:text-sm font-medium whitespace-nowrap text-black/90 drop-shadow-sm">
                  {hour.time}
                </p>
                
                <IconComponent 
                  className={`h-7 w-7 md:h-9 md:w-9 text-black drop-shadow-sm ${
                    isCurrentHour ? '' : ''
                  }`}
                />
                
                <p className="text-base md:text-xl font-bold text-black drop-shadow-sm">
                  {hour.temperature}°C
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default memo(HourlyForecast);
