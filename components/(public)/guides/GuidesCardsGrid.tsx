"use client";

import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import { useQuery } from "@tanstack/react-query";
import {
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { Card, CardContent } from "@/components/ui/card";
import { Route } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GuideDTO } from "@/dto/guides-dto";
import { getGuides } from "@/services/database/guide";
import { GuideCard } from "./guideCard";
import { SearchAndFilters } from "./SearchAndFilters";

type Props = {
  initialData: GuideDTO[];
};

export function GuidesCardsGrid({ initialData }: Props) {
  const [searchProperties, _setSearchProperties] = useQueryStates({
    searchTerm: parseAsString.withDefault(""),
    yearsOfExperience: parseAsInteger.withDefault(0),
    pricePerHour: parseAsFloat.withDefault(0),
    rating: parseAsFloat.withDefault(0),
  });

  const {
    data: guides,
    isLoading,
    isError,
  } = useQuery<GuideDTO[]>({
    queryKey: useQueryCacheKeys.guides(),
    queryFn: () =>
      getGuides({
        searchTerm: searchProperties.searchTerm || undefined,
        yearsOfExperience: searchProperties.yearsOfExperience || undefined,
        pricePerHour: searchProperties.pricePerHour || undefined,
        rating: searchProperties.rating || undefined
      }),
    initialData:
      !searchProperties.searchTerm &&
      !searchProperties.yearsOfExperience &&
      !searchProperties.pricePerHour &&
      !searchProperties.rating
        ? initialData
        : undefined,
  });

  if (isError)
    return <div className="text-red-500">Error fetching guides</div>;

  return (
    <div className="p-4">
      <SearchAndFilters />
      {!isLoading && guides && guides.length === 0 && (
        <Card className="mt-8">
          <CardContent className="pt-6 px-6 flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <Route className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No guides found</h3>
            <p className="text-gray-500 max-w-md">
              {searchProperties.searchTerm ||
              searchProperties.yearsOfExperience ||
              searchProperties.pricePerHour ||
              searchProperties.rating
                ? "No guides match your current filters. Try adjusting your search criteria."
                : "There are no guides available yet."}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2  xl:grid-cols-4 gap-4">
        {guides?.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
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
