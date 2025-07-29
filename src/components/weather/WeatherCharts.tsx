import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { WeatherData } from "@/types/weather";
import { useResponsive } from "@/hooks/useWeather";

// Only register the controllers and elements actually used (Line, Bar, Filler, Tooltip, Title)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler
);

interface WeatherChartsProps {
  data: WeatherData;
  isLoading: boolean;
}

export function WeatherCharts({ data, isLoading }: WeatherChartsProps) {
  const [activeTab, setActiveTab] = useState("temperature");
  const { isMobile, isPortrait } = useResponsive();

  if (isLoading) {
    return (
      <Card className="glass-card border-white/20 p-4 md:p-6">
        <Skeleton className="h-5 md:h-6 w-32 md:w-40 bg-white/20 mb-4" />
        <div className="space-y-4">
          <div className="flex gap-2">
            {['Temperature', 'Humidity', 'Pressure'].map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 bg-white/20 rounded" />
            ))}
          </div>
          <Skeleton className="h-48 md:h-64 w-full bg-white/20 rounded" />
        </div>
      </Card>
    );
  }

  // Responsive data slicing
  const dataPoints = isMobile ? 8 : 12;
  const chartData = data.hourly.slice(0, dataPoints);

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        padding: 12,
        titleFont: {
          size: isMobile ? 12 : 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: isMobile ? 11 : 13,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: isMobile ? 10 : 12,
          },
          maxTicksLimit: isMobile ? 6 : 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: isMobile ? 10 : 12,
          },
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: isMobile ? 3 : 4,
        hoverRadius: isMobile ? 5 : 6,
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
      line: {
        borderWidth: isMobile ? 2 : 3,
        tension: 0.4,
      },
    },
  };

  const temperatureData = {
    labels: chartData.map(hour => hour.time),
    datasets: [
      {
        label: 'Temperature',
        data: chartData.map(hour => hour.temperature),
        borderColor: 'rgba(255, 206, 84, 1)',
        backgroundColor: 'rgba(255, 206, 84, 0.1)',
        pointBackgroundColor: 'rgba(255, 206, 84, 1)',
        pointBorderColor: 'rgba(255, 255, 255, 1)',
        fill: true,
      },
    ],
  };

  const humidityData = {
    labels: chartData.map(hour => hour.time),
    datasets: [
      {
        label: 'Humidity',
        data: chartData.map(hour => hour.humidity),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: 'rgba(255, 255, 255, 1)',
        fill: true,
      },
    ],
  };

  const pressureData = {
    labels: chartData.map(hour => hour.time),
    datasets: [
      {
        label: 'Pressure',
        data: chartData.map(hour => hour.pressure),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
        pointBorderColor: 'rgba(255, 255, 255, 1)',
        fill: true,
      },
    ],
  };

  const precipitationData = {
    labels: chartData.map(hour => hour.time),
    datasets: [
      {
        label: 'Precipitation',
        data: chartData.map(hour => hour.precipitation),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const getChartData = (tabValue: string) => {
    switch (tabValue) {
      case 'humidity':
        return humidityData;
      case 'pressure':
        return pressureData;
      case 'precipitation':
        return precipitationData;
      default:
        return temperatureData;
    }
  };

  const getChartOptions = (tabValue: string) => {
    const options = JSON.parse(JSON.stringify(baseChartOptions));
    
    // Customize Y-axis based on data type
    if (tabValue === 'temperature') {
      options.scales.y.ticks.callback = function(value: string | number) {
        return value + '°';
      };
    } else if (tabValue === 'humidity' || tabValue === 'precipitation') {
      options.scales.y.ticks.callback = function(value: string | number) {
        return value + '%';
      };
    } else if (tabValue === 'pressure') {
      options.scales.y.ticks.callback = function(value: string | number) {
        return value + ' mb';
      };
    }

    return options;
  };

  const ChartComponent = activeTab === 'precipitation' ? Bar : Line;

  return (
    <Card className="glass-card border-white/20 p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-contrast-high mb-4">
        Weather Trends
      </h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop: Grid layout, Mobile: Scrollable layout */}
        {isMobile ? (
          <div className="w-full">
            <TabsList className="flex w-max bg-white/10 border-white/20 px-1 overflow-visible">
              <TabsTrigger 
                value="temperature" 
                className="text-contrast-soft data-[state=active]:text-contrast-high data-[state=active]:bg-white/20 text-xs px-3 whitespace-nowrap"
              >
                Temperature
              </TabsTrigger>
              <TabsTrigger 
                value="humidity" 
                className="text-contrast-soft data-[state=active]:text-contrast-high data-[state=active]:bg-white/20 text-xs px-3 whitespace-nowrap"
              >
                Humidity
              </TabsTrigger>
              <TabsTrigger 
                value="pressure" 
                className="text-contrast-soft data-[state=active]:text-contrast-high data-[state=active]:bg-white/20 text-xs px-3 whitespace-nowrap"
              >
                Pressure
              </TabsTrigger>
              <TabsTrigger 
                value="precipitation" 
                className="text-contrast-soft data-[state=active]:text-contrast-high data-[state=active]:bg-white/20 text-xs px-3 whitespace-nowrap"
              >
                Rain
              </TabsTrigger>
            </TabsList>
          </div>
        ) : (
          <TabsList className="grid w-full bg-white/10 border-white/20 grid-cols-4 h-10">
            <TabsTrigger 
              value="temperature" 
              className="text-contrast-soft data-[state=active]:text-contrast-high data-[state=active]:bg-white/20 text-sm"
            >
              Temperature
            </TabsTrigger>
            <TabsTrigger 
              value="humidity" 
              className="text-contrast-soft data-[state=active]:text-contrast-high data-[state=active]:bg-white/20 text-sm"
            >
              Humidity
            </TabsTrigger>
            <TabsTrigger 
              value="pressure" 
              className="text-contrast-soft data-[state=active]:text-contrast-high data-[state=active]:bg-white/20 text-sm"
            >
              Pressure
            </TabsTrigger>
            <TabsTrigger 
              value="precipitation" 
              className="text-contrast-soft data-[state=active]:text-contrast-high data-[state=active]:bg-white/20 text-sm"
            >
              Rain
            </TabsTrigger>
          </TabsList>
        )}

        {['temperature', 'humidity', 'pressure', 'precipitation'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className={`relative ${isMobile && isPortrait ? 'h-48' : 'h-64 md:h-72'}`}>
              <ChartComponent
                data={getChartData(tab)}
                options={getChartOptions(tab)}
              />
            </div>
            
            {/* Chart summary for mobile */}
            {isMobile && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-contrast-soft">High</p>
                  <p className="text-sm font-medium text-contrast-medium">
                    {Math.max(...getChartData(tab).datasets[0].data)}
                    {tab === 'temperature' ? '°' : tab === 'pressure' ? ' mb' : '%'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-contrast-soft">Low</p>
                  <p className="text-sm font-medium text-contrast-medium">
                    {Math.min(...getChartData(tab).datasets[0].data)}
                    {tab === 'temperature' ? '°' : tab === 'pressure' ? ' mb' : '%'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-contrast-soft">Avg</p>
                  <p className="text-sm font-medium text-contrast-medium">
                    {Math.round(getChartData(tab).datasets[0].data.reduce((a, b) => a + b, 0) / getChartData(tab).datasets[0].data.length)}
                    {tab === 'temperature' ? '°' : tab === 'pressure' ? ' mb' : '%'}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
