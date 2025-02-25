"use client";
import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQueryStates, parseAsInteger, parseAsString, parseAsFloat } from "nuqs";

const filterOptions = {
  yearsOfExperience: [
    { value: "1", label: "1 year" },
    { value: "2", label: "2 years" },
    { value: "3", label: "3 years" },
    { value: "4", label: "4+" },
  ],
  pricePerHour: [
    { value: "75", label: "50-100 DHS" },
    { value: "125", label: "100-150 DHS" },
    { value: "175", label: "150-200DHS" },
    { value: "200", label: "200+ DHS" },
  ],
  rating: [
    { value: "4", label: "4+ stars" },
    { value: "3", label: "3+ stars" },
    { value: "2", label: "2+ stars" },
  ]
};

export function SearchAndFilters() {
  const [searchProperties, setSearchProperties] = useQueryStates({
    searchTerm: parseAsString.withDefault(""),
    yearsOfExperience: parseAsInteger.withDefault(0),
    pricePerHour: parseAsFloat.withDefault(0),
    rating: parseAsFloat.withDefault(0),
  });

  const [open, setOpen] = React.useState(false);
  const [selectedFilters, setSelectedFilters] = React.useState<
    Array<{ type: string; value: string; label: string }>
  >([]);

  // Helper function to get the label for a filter value
  const getFilterLabel = (type: string, value: string) => {
    return filterOptions[type as keyof typeof filterOptions]?.find(
      (option) => option.value === value
    )?.label;
  };

  const handleFilterSelect = (type: string, value: string) => {
    const label = getFilterLabel(type, value);
    if (!label) return;

    setSelectedFilters((prev) => {
      // Remove if already exists
      const filtered = prev.filter(
        (filter) => !(filter.type === type && filter.value === value)
      );
      // Add if it didn't exist
      if (filtered.length === prev.length) {
        return [...filtered, { type, value, label }];
      }
      return filtered;
    });
  };

  const removeFilter = (type: string, value: string) => {
    setSelectedFilters((prev) =>
      prev.filter((filter) => !(filter.type === type && filter.value === value))
    );
  };

  const applyFilters = () => {
    const newProperties: {
      yearsOfExperience: number;
      pricePerHour: number;
      rating: number;
    } = {
      yearsOfExperience: 0,
      pricePerHour: 0,
      rating: 0,
    };

    selectedFilters.forEach((filter) => {
      switch (filter.type) {
        case "yearsOfExperience":
          newProperties.yearsOfExperience = parseInt(filter.value);
          break;
        case "pricePerHour":
          newProperties.pricePerHour = parseFloat(filter.value);
          break;
        case "rating":
          newProperties.rating = parseFloat(filter.value);
          break;
      }
    });

    setSearchProperties(newProperties);
    setOpen(false);
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setSearchProperties({
      yearsOfExperience: 0,
      pricePerHour: 0,
      rating: 0,
    });
    setOpen(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 mb-5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search guides..."
            className="pl-10"
            value={searchProperties.searchTerm}
            onChange={(e) =>
              setSearchProperties({
                searchTerm: e.target.value,
              })
            }
          />
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {selectedFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-4" align="end">
            <div className="space-y-4">

              {/* Filter categories */}
              <div className="space-y-4">
                {Object.entries(filterOptions).map(([category, options]) => (
                  <div key={category}>
                    <h3 className="mb-2 text-sm font-medium">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => {
                        const isSelected = selectedFilters.some(
                          (filter) =>
                            filter.type === category && filter.value === option.value
                        );
                        return (
                          <Badge
                            key={option.value}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleFilterSelect(category, option.value)}
                          >
                            {option.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
                <Button className="flex-1" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}