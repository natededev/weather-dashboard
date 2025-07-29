import { WeatherData, WeatherCondition, HourlyWeatherData } from "@/types/weather";

// Generate dynamic 24-hour forecast starting from current time
function generate24HourForecast(): HourlyWeatherData[] {
  const forecast: HourlyWeatherData[] = [];
  const now = new Date();
  const currentHour = now.getHours();
  
  // Weather conditions cycle for variety
  const weatherPatterns: WeatherCondition[] = [
    "sunny", "sunny", "cloudy", "cloudy", "rainy", "partly-cloudy", 
    "sunny", "cloudy", "partly-cloudy", "rainy", "sunny", "cloudy"
  ];
  
  // Base temperature that varies throughout the day
  const baseTemp = 68;
  
  for (let i = 0; i < 24; i++) {
    const forecastTime = new Date(now);
    forecastTime.setHours(currentHour + i);
    
    // Format time properly
    let timeString;
    if (i === 0) {
      timeString = "Now";
    } else {
      const hour = forecastTime.getHours();
      const isPM = hour >= 12;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      timeString = `${displayHour} ${isPM ? 'PM' : 'AM'}`;
    }
    
    // Generate realistic temperature curve (warmer during day, cooler at night)
    const hourInDay = forecastTime.getHours();
    let tempVariation;
    if (hourInDay >= 6 && hourInDay <= 18) {
      // Daytime: warmer temperatures
      tempVariation = Math.sin((hourInDay - 6) * Math.PI / 12) * 8;
    } else {
      // Nighttime: cooler temperatures
      tempVariation = -5 + Math.random() * 3;
    }
    
    const temperature = Math.round(baseTemp + tempVariation + (Math.random() - 0.5) * 4);
    
    // Weather condition based on pattern and some randomness
    const weatherIndex = (i + Math.floor(Math.random() * 3)) % weatherPatterns.length;
    const icon = weatherPatterns[weatherIndex];
    
    // Precipitation based on weather condition
    let precipitation = 0;
    switch (icon) {
      case "rainy":
        precipitation = 60 + Math.random() * 30;
        break;
      case "cloudy":
        precipitation = Math.random() * 20;
        break;
      case "partly-cloudy":
        precipitation = Math.random() * 10;
        break;
      default:
        precipitation = 0;
    }
    
    // Other realistic values
    const humidity = Math.round(45 + Math.random() * 30 + (precipitation / 100) * 20);
    const pressure = Math.round(1010 + Math.random() * 15);
    const windSpeed = Math.round(5 + Math.random() * 10);
    
    forecast.push({
      time: timeString,
      temperature,
      icon,
      precipitation: Math.round(precipitation),
      humidity,
      pressure,
      windSpeed
    });
  }
  
  return forecast;
}

export const mockWeatherData: WeatherData = {
  current: {
    temperature: 68, // Changed to a cooler temp for sky blue gradient
    condition: "partly cloudy",
    description: "partly cloudy with a chance of sunshine",
    icon: "partly-cloudy" as WeatherCondition, // Changed to partly-cloudy for better gradient
    feelsLike: 72,
    humidity: 65,
    windSpeed: 8,
    pressure: 1013,
    visibility: 10,
    uvIndex: 5,
    sunrise: "6:42 AM",
    sunset: "7:18 PM",
    windDirection: "NW",
    dewPoint: 58,
  },
  hourly: generate24HourForecast(),
  daily: [
    { day: "Today", high: 78, low: 55, icon: "rainy" as WeatherCondition, precipitation: 60 },
    { day: "Tue", high: 82, low: 58, icon: "sunny" as WeatherCondition, precipitation: 0 },
    { day: "Wed", high: 79, low: 56, icon: "cloudy" as WeatherCondition, precipitation: 20 },
    { day: "Thu", high: 75, low: 52, icon: "rainy" as WeatherCondition, precipitation: 80 },
    { day: "Fri", high: 71, low: 48, icon: "rainy" as WeatherCondition, precipitation: 90 },
    { day: "Sat", high: 73, low: 50, icon: "cloudy" as WeatherCondition, precipitation: 30 },
    { day: "Sun", high: 77, low: 54, icon: "sunny" as WeatherCondition, precipitation: 10 },
  ],
};