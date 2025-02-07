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
        ...searchProperties,
      }),
  });

  if (isLoading)
    return <div className="grid place-items-center">Loading...</div>;
  if (isError)
    return <div className="text-red-500">Error fetching circuits</div>;

  return (
    <div className="p-4">
      <SearchAndFilters />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {circuits?.map((circuit) => (
          <CircuitCard key={circuit.id} circuit={circuit} />
        ))}
      </div>
    </div>
  );
}
