"use client";
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useQueryStates,
  parseAsInteger,
  parseAsString,
  parseAsFloat,
} from "nuqs";

export function SearchAndFilters() {
  const [searchProperties, setSearchProperties] = useQueryStates({
    searchTerm: parseAsString.withDefault(""),
    duration: parseAsInteger.withDefault(0),
    distance: parseAsFloat.withDefault(0),
    rating: parseAsFloat.withDefault(0),
    sortBy: parseAsString.withDefault(""),
  });

  // Helper function to convert number to string or undefined for Select value
  const getSelectValue = (value: number) => {
    return value === 0 ? undefined : value.toString();
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="relative">
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
      <div className="flex flex-wrap gap-4">
        <Select
          value={getSelectValue(searchProperties.duration)}
          onValueChange={(value) =>
            setSearchProperties({ duration: parseInt(value) || 0 })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 hour</SelectItem>
            <SelectItem value="2">2 hours</SelectItem>
            <SelectItem value="3">3 hours</SelectItem>
            <SelectItem value="4">4 hours</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={getSelectValue(searchProperties.distance)}
          onValueChange={(value) =>
            setSearchProperties({ distance: parseFloat(value) || 0 })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Distance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">0-5 km</SelectItem>
            <SelectItem value="10">5-10 km</SelectItem>
            <SelectItem value="20">10-20 km</SelectItem>
            <SelectItem value="30">20+ km</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={getSelectValue(searchProperties.rating)}
          onValueChange={(value) =>
            setSearchProperties({ rating: parseFloat(value) || 0 })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="3">3+ stars</SelectItem>
            <SelectItem value="2">2+ stars</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchProperties.sortBy || undefined}
          onValueChange={(value) => setSearchProperties({ sortBy: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}