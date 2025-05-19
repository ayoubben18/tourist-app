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
import { useEffect, useRef, useState } from "react";
import { FormProp } from "../lib";
import { SelectableCard } from "../selectable-card";
import {
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useCircuitCreationStore } from "@/stores/create-circuit-store";
import Pagination from "@/components/shared/pagination-comp";

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

  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);
  const [currentPlacesPage, setCurrentPlacesPage] = useState<number>(1);
  const [displayedPlaces, setDisplayedPlaces] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);
  const [paginationChain, setPaginationChain] = useState<
    (google.maps.places.PlaceSearchPagination | null)[]
  >([]);
  const [estimatedTotalPages, setEstimatedTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    selectedLocation,
    setSelectedLocation,
    selectedPlaces,
    setSelectedPlaces,
  } = useCircuitCreationStore();

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );
      setPlacesService(service);
    }
  }, []);

  const onPlaceChanged = async () => {
    form.setValue("places", []);
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.place_id && place.geometry?.location) {
        form.setValue("city", place.place_id);
        setSearchQuery(""); // Clear search query on new city
        setSelectedLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        // Reset will be handled by the effect below watching selectedLocation & searchQuery
      }
    }
  };

  // Effect to reset pagination when search context (query or location) changes
  useEffect(() => {
    setCurrentPlacesPage(1);
    setDisplayedPlaces([]);
    setPaginationChain([]);
    setEstimatedTotalPages(1);
    // setIsLoadingPlaces(true); // Main effect will handle this to avoid quick flashes
  }, [searchQuery, selectedLocation]);

  // Effect for fetching places (either nearbySearch or textSearch)
  useEffect(() => {
    if (!selectedLocation || !placesService) {
      setDisplayedPlaces([]);
      setPaginationChain([]);
      setEstimatedTotalPages(1);
      setIsLoadingPlaces(false);
      return;
    }

    setIsLoadingPlaces(true);

    const callback: (
      results: google.maps.places.PlaceResult[] | null,
      status: google.maps.places.PlacesServiceStatus,
      paginator: google.maps.places.PlaceSearchPagination | null
    ) => void = (results, status, paginator) => {
      setIsLoadingPlaces(false);
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const formattedPlaces: Place[] = results.map(
          (result: google.maps.places.PlaceResult) => ({
            id: result.place_id || "",
            name: result.name || "",
            description: result.vicinity || "", // textSearch might not have vicinity, but name/formatted_address
            image:
              result.photos?.[0]?.getUrl() || "https://i.sstatic.net/y9DpT.jpg",
            latitude: result.geometry?.location?.lat().toString(),
            longitude: result.geometry?.location?.lng().toString(),
          })
        );
        setDisplayedPlaces(formattedPlaces);

        setPaginationChain((prevChain) => {
          const newChain = [...prevChain];
          newChain[currentPlacesPage - 1] = paginator;
          return newChain;
        });

        if (paginator && paginator.hasNextPage) {
          // Google generally provides up to 3 pages (initial + 2 next pages)
          if (currentPlacesPage === 1) setEstimatedTotalPages(2);
          else if (currentPlacesPage === 2) setEstimatedTotalPages(3);
          // else, if already on page 3, hasNextPage should be false
        } else {
          setEstimatedTotalPages(currentPlacesPage);
        }
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        setDisplayedPlaces([]);
        setEstimatedTotalPages(currentPlacesPage); // Or 1 if preferred
      } else {
        console.error(
          `Google Places API error: ${status} for page ${currentPlacesPage} (query: '${searchQuery}')`
        );
        setDisplayedPlaces([]);
        setEstimatedTotalPages(currentPlacesPage);
      }
    };

    if (currentPlacesPage === 1) {
      // Initial fetch for the current context (city/search query)
      if (searchQuery.trim() !== "") {
        const request: google.maps.places.TextSearchRequest = {
          query: searchQuery.trim(),
          location: selectedLocation,
          radius: 20000, // Radius in meters to bias results
          type: "tourist_attraction",
        };
        placesService.textSearch(request, callback);
      } else {
        const request: google.maps.places.PlaceSearchRequest = {
          location: selectedLocation,
          radius: 20000, // 20km radius
          type: "tourist_attraction",
          rankBy: google.maps.places.RankBy.PROMINENCE,
        };
        placesService.nearbySearch(request, callback);
      }
    } else {
      // Paginated fetch
      const paginatorForPreviousPage = paginationChain[currentPlacesPage - 2];
      if (paginatorForPreviousPage && paginatorForPreviousPage.hasNextPage) {
        paginatorForPreviousPage.nextPage(); // This re-uses the same callback
      } else {
        setIsLoadingPlaces(false);
        if (estimatedTotalPages >= currentPlacesPage) {
          setEstimatedTotalPages(currentPlacesPage - 1 > 0 ? currentPlacesPage - 1 : 1);
        }
        console.warn(
          `Attempted to fetch page ${currentPlacesPage} (query: '${searchQuery}') but no valid paginator or no next page.`
        );
      }
    }
  }, [placesService, selectedLocation, currentPlacesPage, searchQuery]);


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
                    {displayedPlaces?.map((place) => (
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
              placeholder="Search places in the selected city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingPlaces
                ? Array.from({ length: 6 }).map((_, index) => ( // Reduced skeleton count
                  <Skeleton key={index} className="w-full h-40 rounded-md" />
                ))
                : displayedPlaces?.map((place) => (
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
            {!isLoadingPlaces && displayedPlaces && displayedPlaces.length > 0 && estimatedTotalPages > 0 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  page={currentPlacesPage}
                  setPage={setCurrentPlacesPage}
                  pageSize={20}
                  totalCount={estimatedTotalPages * 20}
                />
              </div>
            )}
            {!isLoadingPlaces && displayedPlaces && displayedPlaces.length === 0 && (
              <Card className="p-6 mt-4">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="text-muted-foreground">
                    No places found. Try a different search or check the selected city.
                  </div>
                </div>
              </Card>
            )}
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
