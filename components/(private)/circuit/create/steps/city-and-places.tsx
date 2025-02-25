import { AutoComplete, type Option } from "@/components/shared/autocomplete";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { FormProp } from "../lib";
import { SelectableCard } from "../selectable-card";
import {
  LoadScript,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useCircuitCreationStore } from "@/stores/create-circuit-store";

type Place = {
  id: string;
  name: string;
  description?: string;
  image: string;
  latitude?: string;
  longitude?: string;
};

type Props = {
  form: FormProp;
};

const CityAndPlaces = ({ form }: Props) => {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);

  const {
    selectedLocation,
    setSelectedLocation,
    selectedPlaces,
    setSelectedPlaces,
  } = useCircuitCreationStore();

  const onPlaceChanged = async () => {
    form.setValue("places", []);
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.place_id && place.geometry?.location) {
        form.setValue("city", place.place_id);
        setSearchQuery("");
        setSelectedLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  const { data: nearbyPlaces, isLoading: isLoadingPlaces } = useQuery({
    queryKey: ["nearbyPlaces", selectedLocation],
    queryFn: () => fetchNearbyPlaces(selectedLocation!),
    enabled: !!selectedLocation,
  });

  const fetchNearbyPlaces = async (location: google.maps.LatLngLiteral) => {
    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    const request: google.maps.places.PlaceSearchRequest = {
      location: location,
      radius: 20000, // 20km radius
      type: "tourist_attraction",
      rankBy: google.maps.places.RankBy.PROMINENCE,
    };

    return new Promise<Place[]>((resolve, reject) => {
      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const formattedPlaces: Place[] = results.map((result) => ({
            id: result.place_id || "",
            name: result.name || "",
            description: result.vicinity || "",
            image:
              result.photos?.[0]?.getUrl() || "https://i.sstatic.net/y9DpT.jpg",
            latitude: result.geometry?.location?.lat().toString(),
            longitude: result.geometry?.location?.lng().toString(),
          }));
          resolve(formattedPlaces);
        } else {
          reject(new Error(`Places API error: ${status}`));
        }
      });
    });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const filteredPlaces = nearbyPlaces?.filter((place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaceSelection = (placeId: string) => {
    const newSelectedPlaces = new Set(selectedPlaces);
    if (selectedPlaces.has(placeId)) {
      newSelectedPlaces.delete(placeId);
    } else {
      newSelectedPlaces.add(placeId);
    }
    setSelectedPlaces(newSelectedPlaces);
    form.setValue("places", Array.from(newSelectedPlaces).map(String));
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <Autocomplete
                  onLoad={setAutocomplete}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    types: ["(cities)"],
                  }}
                >
                  <Input
                    ref={autoCompleteRef}
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Search for a city..."
                  />
                </Autocomplete>

                <div className="h-[300px] w-full rounded-md">
                  <GoogleMap
                    zoom={12}
                    center={selectedLocation || { lat: 51.5074, lng: -0.1278 }}
                    mapContainerClassName="w-full h-full rounded-md"
                  >
                    {selectedLocation && <Marker position={selectedLocation} />}
                    {nearbyPlaces?.map((place) => (
                      <Marker
                        key={place.id}
                        position={{
                          lat: parseFloat(place.latitude || "0"),
                          lng: parseFloat(place.longitude || "0"),
                        }}
                        onClick={() => handlePlaceSelection(place.id)}
                      />
                    ))}
                  </GoogleMap>
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Select the city where your circuit will take place
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <Label>Places</Label>
        {!form.watch("city") ? (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="text-muted-foreground">
                Please select a city first to view available places
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingPlaces
                ? Array.from({ length: 12 }).map((_, index) => (
                    <Skeleton key={index} className="w-full h-40 rounded-md" />
                  ))
                : filteredPlaces?.map((place) => (
                    <SelectableCard
                      key={place.id}
                      selected={selectedPlaces.has(place.id)}
                      onClick={() => handlePlaceSelection(place.id)}
                      title={place.name}
                      description={place.description}
                      image={place.image}
                    />
                  ))}
            </div>
          </>
        )}
        <FormDescription>
          Select the places you want to visit in your circuit
        </FormDescription>
      </div>
    </div>
  );
};

export default CityAndPlaces;
