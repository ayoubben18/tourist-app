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
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const onPlaceChanged = async () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.place_id && place.geometry?.location) {
        form.setValue("city", place.place_id);
        setSearchQuery("");
        setSelectedLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        // Fetch nearby places using the city's coordinates
        await fetchNearbyPlaces(place.geometry.location);
      }
    }
  };

  const fetchNearbyPlaces = async (location: google.maps.LatLng) => {
    setIsLoadingPlaces(true);
    try {
      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );

      const request: google.maps.places.PlaceSearchRequest = {
        location: location,
        radius: 20000, // 20km radius
        type: "tourist_attraction",
        rankBy: google.maps.places.RankBy.PROMINENCE,
      };

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
          setPlaces(formattedPlaces);
        }
        setIsLoadingPlaces(false);
      });
    } catch (error) {
      console.error("Failed to fetch places:", error);
      setIsLoadingPlaces(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());

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
              <LoadScript
                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                libraries={["places"]}
              >
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
                      center={
                        selectedLocation || { lat: 51.5074, lng: -0.1278 }
                      }
                      mapContainerClassName="w-full h-full rounded-md"
                    >
                      {selectedLocation && (
                        <Marker position={selectedLocation} />
                      )}
                      {places.map((place) => (
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
              </LoadScript>
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
              {filteredPlaces.map((place) => (
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
