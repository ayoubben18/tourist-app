"use client";

import { getPublicCircuits } from "@/services/database/publicCircuits";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import { useQuery } from "@tanstack/react-query";
import {
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { CircuitCard } from "./CircuitCard";
import { SearchAndFilters } from "./SearchAndFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Route } from "lucide-react";

export function CardsGrid() {
  const [searchProperties, _setSearchProperties] = useQueryStates({
    searchTerm: parseAsString.withDefault(""),
    duration: parseAsInteger.withDefault(0),
    distance: parseAsFloat.withDefault(0),
    rating: parseAsFloat.withDefault(0),
    sortBy: parseAsString.withDefault(""),
  });

  const {
    data: circuits,
    isLoading,
    isError,
  } = useQuery({
    queryKey: useQueryCacheKeys.publicCircuits(searchProperties),
    queryFn: () =>
      getPublicCircuits({
        searchTerm: searchProperties.searchTerm || undefined,
        duration: searchProperties.duration || null,
        distance: searchProperties.distance || null,
        rating: searchProperties.rating || null,
        sortBy: searchProperties.sortBy || undefined,
      }),
  });

  if (isLoading)
    return <div className="grid place-items-center">Loading...</div>;
  if (isError)
    return <div className="text-red-500">Error fetching circuits</div>;

  return (
    <div className="p-4">
      <SearchAndFilters />
      {circuits && circuits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {circuits.map((circuit) => (
            <CircuitCard key={circuit.id} circuit={circuit} />
          ))}
        </div>
      ) : (
        <Card className="mt-8">
          <CardContent className="pt-6 px-6 flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <Route className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No circuits found</h3>
            <p className="text-gray-500 max-w-md">
              {searchProperties.searchTerm || searchProperties.duration || searchProperties.distance || searchProperties.rating
                ? "No circuits match your current filters. Try adjusting your search criteria."
                : "There are no circuits available yet. Be the first to create one!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
