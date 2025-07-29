import React, { useState, useEffect } from 'react';
import { Settings, Key, Eye, EyeOff, Save, RotateCcw, MapPin, Thermometer, Wind, Droplets, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { weatherUtils } from '@/lib/weatherApi';

interface WeatherSettingsProps {
  onApiKeyChange?: (apiKey: string) => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

export interface AppSettings {
  units: 'metric' | 'imperial' | 'kelvin';
  language: string;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  showNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  defaultLocation?: string;
  showDetailedMetrics: boolean;
  chartAnimations: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  units: 'metric',
  language: 'en',
  autoRefresh: true,
  refreshInterval: 30,
  showNotifications: true,
  theme: 'auto',
  showDetailedMetrics: true,
  chartAnimations: true,
};

export function WeatherSettings({ onApiKeyChange, onSettingsChange }: WeatherSettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openweather-api-key') || '';
    const savedSettings = localStorage.getItem('weather-app-settings');
    
    setApiKey(savedApiKey);
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setHasUnsavedChanges(true);
  };

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('openweather-api-key', apiKey);
    localStorage.setItem('weather-app-settings', JSON.stringify(settings));
    
    onApiKeyChange?.(apiKey);
    onSettingsChange?.(settings);
    
    setHasUnsavedChanges(false);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasUnsavedChanges(true);
  };

  const isApiConfigured = weatherUtils.isAPIConfigured() || apiKey.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Weather App Settings</h2>
        </div>
        {hasUnsavedChanges && (
          <Badge variant="secondary" className="animate-pulse">
            Unsaved changes
          </Badge>
        )}
      </div>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="display">Display & UI</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                OpenWeather API Configuration
              </CardTitle>
              <CardDescription>
                Configure your OpenWeather API key to get real-time weather data. 
                <a 
                  href="https://openweathermap.org/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 ml-1 text-primary hover:underline"
                >
                  Get API key <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your OpenWeather API key"
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <div className="flex items-start gap-2">
                    <div className={`h-2 w-2 rounded-full mt-2 ${isApiConfigured ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <strong>Status:</strong> {weatherUtils.getAPIStatus()}
                      {!isApiConfigured && (
                        <div className="mt-1 text-sm">
                          Without an API key, the app will use mock data for demonstration.
                        </div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Free tier includes:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>1,000 API calls per day</li>
                  <li>Current weather data</li>
                  <li>5-day weather forecast</li>
                  <li>Historical weather data (limited)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Units & Language
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="units">Temperature Units</Label>
                  <Select
                    value={settings.units}
                    onValueChange={(value) => handleSettingChange('units', value as AppSettings['units'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Celsius (°C)</SelectItem>
                      <SelectItem value="imperial">Fahrenheit (°F)</SelectItem>
                      <SelectItem value="kelvin">Kelvin (K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => handleSettingChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-4 w-4" />
                Data & Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh">Auto-refresh weather data</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically update weather information
                  </p>
                </div>
                <Switch
                  id="auto-refresh"
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
                />
              </div>

              {settings.autoRefresh && (
                <div className="space-y-2">
                  <Label htmlFor="refresh-interval">Refresh interval (minutes)</Label>
                  <Select
                    value={settings.refreshInterval.toString()}
                    onValueChange={(value) => handleSettingChange('refreshInterval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Weather notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications for weather alerts
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.showNotifications}
                  onCheckedChange={(checked) => handleSettingChange('showNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Display Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange('theme', value as AppSettings['theme'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (system)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="detailed-metrics">Show detailed metrics</Label>
                  <p className="text-sm text-muted-foreground">
                    Display additional weather parameters
                  </p>
                </div>
                <Switch
                  id="detailed-metrics"
                  checked={settings.showDetailedMetrics}
                  onCheckedChange={(checked) => handleSettingChange('showDetailedMetrics', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="chart-animations">Chart animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth transitions in charts
                  </p>
                </div>
                <Switch
                  id="chart-animations"
                  checked={settings.chartAnimations}
                  onCheckedChange={(checked) => handleSettingChange('chartAnimations', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button onClick={saveSettings} disabled={!hasUnsavedChanges} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
        <Button variant="outline" onClick={resetSettings} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
