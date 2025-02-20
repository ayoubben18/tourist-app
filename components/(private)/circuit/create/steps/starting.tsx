import React, { useRef, useState } from "react";
import { FormProp } from "../lib";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LoadScript,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type Props = {
  form: FormProp;
};

const Starting = ({ form }: Props) => {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.place_id && place.geometry?.location) {
        form.setValue("startingPlace", place.place_id);
        setSelectedLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="startingPlace"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Starting Place</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <LoadScript
                  googleMapsApiKey={
                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
                  }
                  libraries={["places"]}
                >
                  <Autocomplete
                    onLoad={setAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <Input
                      ref={autoCompleteRef}
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Search for a location..."
                    />
                  </Autocomplete>
                  <div className="h-[300px] w-full rounded-md mt-4">
                    <GoogleMap
                      zoom={15}
                      center={
                        selectedLocation || { lat: 51.5074, lng: -0.1278 }
                      }
                      mapContainerClassName="w-full h-full rounded-md"
                      onClick={(e) => {
                        if (e.latLng) {
                          const newLocation = {
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                          };
                          setSelectedLocation(newLocation);
                          // Create a Geocoder to get the place ID from coordinates
                          const geocoder = new google.maps.Geocoder();
                          geocoder.geocode(
                            { location: newLocation },
                            (results, status) => {
                              if (
                                status === "OK" &&
                                results &&
                                results[0] &&
                                results[0].place_id
                              ) {
                                form.setValue(
                                  "startingPlace",
                                  results[0].place_id
                                );
                                if (autoCompleteRef.current) {
                                  autoCompleteRef.current.value =
                                    results[0].formatted_address;
                                }
                              }
                            }
                          );
                        }
                      }}
                    >
                      {selectedLocation && (
                        <Marker position={selectedLocation} />
                      )}
                    </GoogleMap>
                  </div>
                </LoadScript>
              </div>
            </FormControl>
            <FormDescription>
              Search for a location or click on the map to select your starting
              point
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="startTime"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Start Date and Time</FormLabel>
            <div className="flex gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        const currentTime = field.value || new Date();
                        date.setHours(currentTime.getHours());
                        date.setMinutes(currentTime.getMinutes());
                        field.onChange(date);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                className="w-[180px]"
                value={format(field.value || new Date(), "HH:mm")}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value
                    .split(":")
                    .map(Number);
                  const newDate = new Date(field.value || new Date());
                  newDate.setHours(hours);
                  newDate.setMinutes(minutes);
                  field.onChange(newDate);
                }}
              />
            </div>
            <FormDescription>
              Select when you want to start your circuit
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Starting;
