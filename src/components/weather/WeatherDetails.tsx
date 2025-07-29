import React, { memo } from "react";
import { 
  Gauge, 
  Eye, 
  Sunrise, 
  Sunset, 
  Wind, 
  Droplets,
  Sun,
  Thermometer,
  LucideIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentWeatherData } from "@/types/weather";
import { 
  getUVLevel, 
  formatWind, 
  formatPressure, 
  formatVisibility, 
  formatTemperature,
  getAirQualityInfo 
} from "@/lib/weatherUtils";
import { useResponsive } from "@/hooks/useWeather";

interface WeatherDetailsProps {
  data: CurrentWeatherData;
  isLoading: boolean;
}

interface WeatherDetailItem {
  icon: LucideIcon;
  label: string;
  value: string;
  extra?: string;
  extraClass?: string;
  description?: string;
}

function WeatherDetails({ data, isLoading }: WeatherDetailsProps) {
  const { isMobile, isPortrait } = useResponsive();

  if (isLoading) {
    return (
      <Card className="glass-card border-white/20 p-4 md:p-6 min-h-[380px]">
        <Skeleton className="h-5 md:h-6 w-32 md:w-40 bg-white/20 mb-4" />
        <div className={`grid gap-3 md:gap-4 ${
          isMobile && isPortrait ? 'grid-cols-2' : 'grid-cols-2'
        }`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2 min-h-[44px]">
              <Skeleton className="h-5 w-20 bg-white/20" />
              <Skeleton className="h-6 w-24 bg-white/20" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const uvInfo = getUVLevel(data.uvIndex);
  const airQuality = getAirQualityInfo(data.pressure, data.humidity);

  const details: WeatherDetailItem[] = [
    {
      icon: Sun,
      label: "UV Index",
      value: data.uvIndex.toString(),
      extra: uvInfo.level,
      extraClass: uvInfo.color,
      description: uvInfo.description,
    },
    {
      icon: Eye,
      label: "Visibility",
      value: formatVisibility(data.visibility),
      description: "Clear visibility",
    },
    {
      icon: Sunrise,
      label: "Sunrise",
      value: data.sunrise,
      description: "Dawn time",
    },
    {
      icon: Sunset,
      label: "Sunset",
      value: data.sunset,
      description: "Dusk time",
    },
    {
      icon: Wind,
      label: "Wind",
      value: `${data.windSpeed} mph`,
      extra: data.windDirection,
      extraClass: "text-black/70",
      description: formatWind(data.windSpeed, data.windDirection),
    },
    {
      icon: Droplets,
      label: "Humidity",
      value: `${data.humidity}%`,
      description: data.humidity > 70 ? "High humidity" : data.humidity < 30 ? "Low humidity" : "Comfortable",
    },
    {
      icon: Gauge,
      label: "Pressure",
      value: formatPressure(data.pressure),
      extra: airQuality.quality,
      extraClass: airQuality.color,
      description: "Atmospheric pressure",
    },
    {
      icon: Thermometer,
      label: "Dew Point",
      value: formatTemperature(data.dewPoint, 'C'),
      description: "Temperature at which dew forms",
    },
  ];

  return (
    <Card className="glass-card border-white/20 p-4 md:p-6 min-h-[300px]">
      <h3 className="text-base md:text-lg font-semibold text-contrast-high mb-4">
        Weather Details
      </h3>
      
      <div className={`grid gap-3 md:gap-4 ${
        isMobile && isPortrait 
          ? 'grid-cols-2' 
          : isMobile 
            ? 'grid-cols-3' 
            : 'grid-cols-2'
      }`}>
        {details.map((detail, index) => {
          const IconComponent = detail.icon;
          
          return (
            <div
              key={index}
              className="group p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-help"
              aria-label={`${detail.label}: ${detail.value} ${detail.extra || ''}`}
              title={detail.description}
            >
              <div className="flex items-start gap-2 md:gap-3">
                <IconComponent 
                  className="h-4 w-4 md:h-5 md:w-5 icon-contrast flex-shrink-0 mt-0.5" 
                  aria-hidden={true}
                />
                
                <div className="flex-1 overflow-visible">
                  <p className="text-xs md:text-sm text-contrast-soft mb-1 leading-tight">
                    {detail.label}
                  </p>
                  
                  <div className="space-y-1">
                    <p className="text-sm md:text-base font-semibold text-contrast-medium leading-tight">
                      {detail.value}
                    </p>
                    
                    {detail.extra && (
                      <p className={`text-xs leading-tight ${
                        detail.extraClass || 'text-contrast-soft'
                      }`}>
                        {detail.extra}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional insights for larger screens */}
      {!isMobile && (
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="grid grid-cols-1 gap-2 text-xs text-contrast-soft">
            <div className="flex justify-between">
              <span>Air Quality:</span>
              <span className={airQuality.color}>{airQuality.quality}</span>
            </div>
            <div className="flex justify-between">
              <span>Comfort Level:</span>
              <span className="text-contrast-medium">
                {data.humidity >= 40 && data.humidity <= 60 ? 'Comfortable' : 
                 data.humidity > 60 ? 'Humid' : 'Dry'}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default memo(WeatherDetails);
