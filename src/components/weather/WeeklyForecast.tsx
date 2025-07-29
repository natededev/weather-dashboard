import React, { memo } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, Wind, CloudDrizzle, CloudLightning, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyWeatherData, WeatherCondition } from "@/types/weather";
import { formatTemperature } from "@/lib/weatherUtils";
import { useResponsive } from "@/hooks/useWeather";

interface WeeklyForecastProps {
  data: DailyWeatherData[];
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

function WeeklyForecast({ data, isLoading }: WeeklyForecastProps) {
  const { isMobile, isPortrait } = useResponsive();

  if (isLoading) {
    return (
      <Card className="glass-enhanced border-white/20 p-4 md:p-6 no-overlap min-h-[380px]">
        <Skeleton className="h-6 md:h-7 w-40 md:w-48 bg-white/30 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between min-h-[44px]">
              <Skeleton className="h-5 w-16 bg-white/30" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 bg-white/30 rounded-full" />
              </div>
              <Skeleton className="h-5 w-20 bg-white/30" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-enhanced border-white/20 p-4 md:p-6 no-overlap min-h-[380px]">
      <h3 className="text-base md:text-lg font-semibold text-contrast-high mb-4">
        6-Day Forecast
      </h3>
      
      <div className="space-y-3 md:space-y-4">
        {data.map((day, index) => {
          const IconComponent = weatherIcons[day.icon] || Sun;
          const isToday = index === 0;
          
          return (
            <div
              key={index}
              className={`group flex items-center justify-between py-2 md:py-3 px-2 md:px-3 rounded-lg ${
                isToday ? 'bg-white/15 shadow-sm' : 'hover:bg-white/10'
              }`}
              aria-label={`${isToday ? 'Today' : day.day}: High ${formatTemperature(day.high, 'C')}, Low ${formatTemperature(day.low, 'C')}, ${day.icon.replace('-', ' ')}`}
            >
              {/* Day Label */}
              <div className="min-w-0 flex-1">
                <p className="text-sm md:text-base font-medium text-contrast-high">
                  {isToday ? 'Today' : day.day}
                </p>
                {isMobile && day.description && (
                  <p className="text-xs text-contrast-soft mt-1 truncate">
                    {day.description}
                  </p>
                )}
              </div>
              
              {/* Weather Icon - Consistent for all days */}
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 mx-4">
                <IconComponent 
                  className={`h-5 w-5 md:h-6 md:w-6 icon-contrast`}
                  aria-hidden={true}
                />
              </div>
              
              {/* Temperature Range */}
              <div className="flex items-center gap-2 md:gap-3 min-w-fit">
                <span className="text-sm md:text-base font-semibold text-contrast-high">
                  {formatTemperature(day.high, 'C')}
                </span>
                <div className="w-6 md:w-8 h-1 bg-white/30 rounded-full overflow-hidden border border-white/20">
                  <div 
                  className="h-full bg-gradient-to-r from-white/80 to-white/60 rounded-full"
                    style={{ 
                      width: `${Math.max(20, Math.min(100, ((day.high - day.low) / 30) * 100))}%` 
                    }}
                  />
                </div>
                <span className="text-sm md:text-base text-contrast-medium font-medium">
                  {formatTemperature(day.low, 'C')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary for mobile portrait */}
      {isMobile && isPortrait && (
        <div className="mt-4 pt-4 border-t border-white/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-contrast-soft">Avg High</p>
              <p className="text-sm font-medium text-contrast-medium">
                {formatTemperature(Math.round(data.reduce((acc, day) => acc + day.high, 0) / data.length), 'C')}
              </p>
            </div>
            <div>
              <p className="text-xs text-contrast-soft">Avg Low</p>
              <p className="text-sm font-medium text-contrast-medium">
                {formatTemperature(Math.round(data.reduce((acc, day) => acc + day.low, 0) / data.length), 'C')}
              </p>
            </div>
            <div>
              <p className="text-xs text-contrast-soft">Rainy Days</p>
              <p className="text-sm font-medium text-contrast-medium">
                {data.filter(day => day.precipitation > 50).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default memo(WeeklyForecast);
