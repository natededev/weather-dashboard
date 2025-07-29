import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export interface LocationSuggestion {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface WeatherSearchProps {
  onLocationSelect: (location: LocationSuggestion) => void;
  onCurrentLocation?: () => void;
  isLoading?: boolean;
  suggestions?: LocationSuggestion[];
  recentSearches?: LocationSuggestion[];
  placeholder?: string;
  className?: string;
}

export function WeatherSearch({
  onLocationSelect,
  onCurrentLocation,
  isLoading = false,
  suggestions = [],
  recentSearches = [],
  placeholder = "Search for a city...",
  className
}: WeatherSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = [...suggestions, ...recentSearches];
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleLocationSelect(items[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    onLocationSelect(location);
    setQuery(location.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const formatLocationName = (location: LocationSuggestion) => {
    return location.state 
      ? `${location.name}, ${location.state}, ${location.country}`
      : `${location.name}, ${location.country}`;
  };

  const hasResults = suggestions.length > 0 || recentSearches.length > 0;

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-20"
          disabled={isLoading}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {onCurrentLocation && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCurrentLocation}
              disabled={isLoading}
              className="h-8 px-2 flex items-center gap-1 text-xs"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">Current</span>
            </Button>
          )}
        </div>
      </div>

      {/* Dropdown with suggestions and recent searches */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded-md border bg-popover shadow-lg">
          {hasResults ? (
            <div className="p-1">
              {/* Current suggestions */}
              {suggestions.length > 0 && (
                <div>
                  {suggestions.map((location, index) => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationSelect(location)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors",
                        index === selectedIndex && "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{location.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {location.state ? `${location.state}, ` : ''}{location.country}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  {suggestions.length > 0 && (
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-t">
                      Recent Searches
                    </div>
                  )}
                  {recentSearches.map((location, index) => {
                    const adjustedIndex = index + suggestions.length;
                    return (
                      <button
                        key={`recent-${location.id}`}
                        onClick={() => handleLocationSelect(location)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors",
                          adjustedIndex === selectedIndex && "bg-accent text-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 flex items-center justify-center">
                            <div className="h-2 w-2 bg-muted-foreground rounded-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{location.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {formatLocationName(location)}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : query.length > 0 ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : (
                "No locations found"
              )}
            </div>
          ) : (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Start typing to search for a location
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Quick location selection component
interface QuickLocationsProps {
  locations: LocationSuggestion[];
  onLocationSelect: (location: LocationSuggestion) => void;
  className?: string;
}

export function QuickLocations({ 
  locations, 
  onLocationSelect, 
  className 
}: QuickLocationsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {locations.map((location) => (
        <Badge
          key={location.id}
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={() => onLocationSelect(location)}
        >
          <MapPin className="h-3 w-3 mr-1" />
          {location.name}
        </Badge>
      ))}
    </div>
  );
}
