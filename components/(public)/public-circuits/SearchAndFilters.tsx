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
  duration: [
    { value: "1", label: "1 hour" },
    { value: "2", label: "2 hours" },
    { value: "3", label: "3 hours" },
    { value: "4", label: "4 hours" },
  ],
  distance: [
    { value: "5", label: "0-5 km" },
    { value: "10", label: "5-10 km" },
    { value: "20", label: "10-20 km" },
    { value: "30", label: "20+ km" },
  ],
  rating: [
    { value: "4", label: "4+ stars" },
    { value: "3", label: "3+ stars" },
    { value: "2", label: "2+ stars" },
  ],
  sortBy: [
    { value: "popular", label: "Most Popular" },
    { value: "recent", label: "Most Recent" },
    { value: "rating", label: "Highest Rated" },
  ],
};

export function SearchAndFilters() {
  const [searchProperties, setSearchProperties] = useQueryStates({
    searchTerm: parseAsString.withDefault(""),
    duration: parseAsInteger.withDefault(0),
    distance: parseAsFloat.withDefault(0),
    rating: parseAsFloat.withDefault(0),
    sortBy: parseAsString.withDefault(""),
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
      duration: number;
      distance: number;
      rating: number;
      sortBy: string;
    } = {
      duration: 0,
      distance: 0,
      rating: 0,
      sortBy: "",
    };

    selectedFilters.forEach((filter) => {
      switch (filter.type) {
        case "duration":
          newProperties.duration = parseInt(filter.value);
          break;
        case "distance":
          newProperties.distance = parseFloat(filter.value);
          break;
        case "rating":
          newProperties.rating = parseFloat(filter.value);
          break;
        case "sortBy":
          newProperties.sortBy = filter.value;
          break;
      }
    });

    setSearchProperties(newProperties);
    setOpen(false);
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setSearchProperties({
      duration: 0,
      distance: 0,
      rating: 0,
      sortBy: "",
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
            placeholder="Search routes..."
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

              {/* Selected filters */}
              {selectedFilters.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">Selected Filters</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFilters.map((filter) => (
                      <Badge
                        key={`${filter.type}-${filter.value}`}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {filter.label}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFilter(filter.type, filter.value);
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

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