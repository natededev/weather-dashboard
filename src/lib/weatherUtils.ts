import { WeatherCondition, CurrentWeatherData, HourlyWeatherData, DailyWeatherData } from '@/types/weather';

/**
 * Utility functions for weather data processing and formatting
 * Designed to work with both mock data and future API integrations
 */

/**
 * Format temperature with proper unit symbol
 */
export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
  return `${Math.round(temp)}°${unit}`;
}

/**
 * Format wind speed with direction
 */
export function formatWind(speed: number, direction?: string, unit: 'mph' | 'kmh' = 'mph'): string {
  const windSpeed = `${speed} ${unit}`;
  return direction ? `${windSpeed} ${direction}` : windSpeed;
}

/**
 * Format time for different components
 */
export function formatTime(timeString: string, format: '12h' | '24h' = '12h'): string {
  // Handle various time formats that might come from API
  if (timeString.includes('AM') || timeString.includes('PM')) {
    return timeString; // Already in 12h format
  }
  
  // If it's a simple hour like "1 PM", return as is
  if (timeString.includes(' ')) {
    return timeString;
  }
  
  // Handle 24h format like "13:00"
  try {
    const date = new Date(`2000-01-01 ${timeString}`);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: format === '24h' ? '2-digit' : undefined,
      hour12: format === '12h' 
    });
  } catch {
    return timeString; // Fallback to original string
  }
}

/**
 * Get UV index level and color
 */
export function getUVLevel(uvIndex: number): { level: string; color: string; description: string } {
  if (uvIndex <= 2) {
    return { 
      level: "Low", 
      color: "text-green-400", 
      description: "No protection required" 
    };
  }
  if (uvIndex <= 5) {
    return { 
      level: "Moderate", 
      color: "text-yellow-400", 
      description: "Some protection required" 
    };
  }
  if (uvIndex <= 7) {
    return { 
      level: "High", 
      color: "text-orange-400", 
      description: "Protection essential" 
    };
  }
  if (uvIndex <= 10) {
    return { 
      level: "Very High", 
      color: "text-red-400", 
      description: "Extra protection needed" 
    };
  }
  return { 
    level: "Extreme", 
    color: "text-purple-400", 
    description: "Avoid sun exposure" 
  };
}

/**
 * Get weather condition description and styling based on temperature and condition
 */
export function getWeatherConditionInfo(
  condition: WeatherCondition, 
  temperature?: number
): {
  description: string;
  gradient: string;
  textColor: string;
} {
  // Temperature-based gradient selection
  const getTemperatureGradient = (temp: number) => {
    if (temp <= 32) return "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400"; // Freezing - icy blue
    if (temp <= 50) return "bg-gradient-to-br from-blue-500 via-blue-400 to-sky-400"; // Cold - cool blue
    if (temp <= 70) return "bg-gradient-to-br from-sky-400 via-sky-300 to-blue-300"; // Cool - sky blue
    if (temp <= 85) return "bg-gradient-to-br from-yellow-300 via-orange-300 to-yellow-400"; // Warm - sunny
    return "bg-gradient-to-br from-orange-400 via-red-400 to-orange-500"; // Hot - warm orange/red
  };

  const conditions = {
    sunny: {
      description: "Clear and bright",
      gradient: temperature ? getTemperatureGradient(temperature) : "bg-gradient-to-br from-yellow-300 via-orange-300 to-yellow-400",
      textColor: "text-white"
    },
    'partly-cloudy': {
      description: "Partly cloudy",
      gradient: temperature ? getTemperatureGradient(temperature) : "bg-gradient-to-br from-sky-400 via-sky-300 to-blue-300",
      textColor: "text-white"
    },
    cloudy: {
      description: "Overcast",
      gradient: "bg-gradient-to-br from-gray-500 via-gray-400 to-slate-400",
      textColor: "text-white"
    },
    rainy: {
      description: "Rainy conditions",
      gradient: "bg-gradient-to-br from-slate-600 via-slate-500 to-blue-500",
      textColor: "text-white"
    },
    snowy: {
      description: "Snow expected",
      gradient: "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400",
      textColor: "text-white"
    },
    windy: {
      description: "Windy conditions",
      gradient: temperature ? getTemperatureGradient(temperature) : "bg-gradient-to-br from-sky-400 via-sky-300 to-blue-300",
      textColor: "text-white"
    },
    thunderstorm: {
      description: "Thunderstorm warning",
      gradient: "bg-gradient-to-br from-slate-800 via-slate-700 to-purple-600",
      textColor: "text-white"
    },
    fog: {
      description: "Foggy conditions",
      gradient: "bg-gradient-to-br from-gray-400 via-gray-300 to-slate-300",
      textColor: "text-white"
    }
  };

  return conditions[condition] || conditions.sunny;
}

/**
 * Convert 24-hour time to 12-hour format for display
 */
export function convertTo12Hour(time24: string): string {
  try {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return time24; // Return original if parsing fails
  }
}

/**
 * Calculate relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

/**
 * Determine if it's day or night based on current time and sunrise/sunset
 */
export function isDayTime(currentTime?: Date, sunrise?: string, sunset?: string): boolean {
  if (!sunrise || !sunset || !currentTime) return true; // Default to day
  
  try {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const sunriseTime = parseTimeString(sunrise);
    const sunsetTime = parseTimeString(sunset);
    
    return now >= sunriseTime && now <= sunsetTime;
  } catch {
    return true; // Default to day if parsing fails
  }
}

function parseTimeString(timeStr: string): number {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;
  
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
  if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
  
  return totalMinutes;
}

/**
 * Format pressure with proper unit
 */
export function formatPressure(pressure: number, unit: 'mb' | 'inHg' = 'mb'): string {
  if (unit === 'inHg') {
    const inHg = (pressure * 0.02953).toFixed(2);
    return `${inHg} inHg`;
  }
  return `${pressure} mb`;
}

/**
 * Format visibility distance
 */
export function formatVisibility(visibility: number, unit: 'mi' | 'km' = 'mi'): string {
  if (unit === 'km') {
    const km = (visibility * 1.60934).toFixed(1);
    return `${km} km`;
  }
  return `${visibility} mi`;
}

/**
 * Get air quality description based on pressure and humidity (simplified)
 */
export function getAirQualityInfo(pressure: number, humidity: number): {
  quality: string;
  color: string;
  description: string;
} {
  // Simplified air quality estimation
  const normalPressure = pressure >= 1013 && pressure <= 1020;
  const normalHumidity = humidity >= 40 && humidity <= 60;
  
  if (normalPressure && normalHumidity) {
    return {
      quality: "Good",
      color: "text-green-400",
      description: "Air quality is good"
    };
  } else if ((pressure >= 1010 && pressure <= 1025) && (humidity >= 30 && humidity <= 70)) {
    return {
      quality: "Moderate",
      color: "text-yellow-400",
      description: "Air quality is acceptable"
    };
  } else {
    return {
      quality: "Poor",
      color: "text-red-400",
      description: "Air quality may be concerning"
    };
  }
}
