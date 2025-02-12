"use client";

import { getPublicCircuits } from "@/services/database/circuits";
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
import { CircuitsDTO } from "@/dto/circuits-dto";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  initialData: CircuitsDTO[];
};

export function CardsGrid({ initialData }: Props) {
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
  } = useQuery<CircuitsDTO[]>({
    queryKey: useQueryCacheKeys.publicCircuits(searchProperties),
    queryFn: () =>
      getPublicCircuits({
        searchTerm: searchProperties.searchTerm || undefined,
        duration: searchProperties.duration || undefined,
        distance: searchProperties.distance || undefined,
        rating: searchProperties.rating || undefined,
        sortBy: searchProperties.sortBy || undefined,
      }),
    initialData:
      !searchProperties.searchTerm &&
      !searchProperties.duration &&
      !searchProperties.distance &&
      !searchProperties.rating
        ? initialData
        : undefined,
  });

  if (isError)
    return <div className="text-red-500">Error fetching circuits</div>;

  return (
    <div className="p-4">
      <SearchAndFilters />
      {!isLoading && circuits && circuits.length === 0 && (
        <Card className="mt-8">
          <CardContent className="pt-6 px-6 flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <Route className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No circuits found</h3>
            <p className="text-gray-500 max-w-md">
              {searchProperties.searchTerm ||
              searchProperties.duration ||
              searchProperties.distance ||
              searchProperties.rating
                ? "No circuits match your current filters. Try adjusting your search criteria."
                : "There are no circuits available yet. Be the first to create one!"}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {circuits?.map((circuit) => (
          <CircuitCard key={circuit.id} circuit={circuit} />
        ))}
      </div>
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
