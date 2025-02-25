import * as React from "react";
import { useState, useRef } from "react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type City = {
  placeId: string;
  name: string;
};

interface MultiCitySelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

const MultiCitySelect: React.FC<MultiCitySelectProps> = ({ value, onChange, error }) => {
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.place_id && place.geometry && place.types?.includes("locality")) {
        const alreadyAdded = selectedCities.some((city) => city.placeId === place.place_id);
        if (!alreadyAdded) {
          const newCity: City = {
            placeId: place.place_id,
            name: place.name || "",
          };
          const updatedCities = [...selectedCities, newCity];
          setSelectedCities(updatedCities);
          onChange(updatedCities.map((city) => city.placeId));
          
          // Reset the search input
          if (commandInputRef.current) {
            commandInputRef.current.value = '';
          }
        }
      }
    }
  };

  const removeCity = (placeId: string) => {
    const updatedCities = selectedCities.filter((city) => city.placeId !== placeId);
    setSelectedCities(updatedCities);
    onChange(updatedCities.map((city) => city.placeId));
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className={cn(
        "relative overflow-hidden transition-all",
        error && "border-destructive",
        isOpen && "ring-2 ring-primary"
      )}>
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={["places"]}>
          <Command className="border-0">
            <div className="flex items-center border-b px-3">
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={onPlaceChanged}
                options={{ types: ["(cities)"] }}
              >
                <CommandInput
                  ref={commandInputRef}
                  placeholder="Search cities..."
                  onFocus={() => setIsOpen(true)}
                  onBlur={() => setIsOpen(false)}
                  className="flex-1 border-0 outline-none focus:ring-0"
                />
              </Autocomplete>
            </div>
          </Command>
        </LoadScript>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {selectedCities.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Selected Cities</h4>
          </div>
          <ScrollArea className="h-auto max-h-[200px]">
            <div className="flex flex-wrap items-center gap-2">
              {selectedCities.map((city) => (
                <Badge
                  key={city.placeId}
                  variant="secondary"
                  className="pl-3 pr-2 py-1.5 text-sm flex items-center gap-1 group hover:bg-secondary/80"
                >
                  {city.name}
                  <button
                    onClick={() => removeCity(city.placeId)}
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <X className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default MultiCitySelect;