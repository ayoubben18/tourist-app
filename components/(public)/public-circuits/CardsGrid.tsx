"use client"

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CircuitCard } from './CircuitCard';
import { getPublicCircuits } from '@/services/database/publicCircuits';
import { SearchAndFilters } from './SearchAndFilters';

export function CardsGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const { data: circuits, isLoading, isError } = useQuery({
    queryKey: ['publicCircuits', searchTerm, durationFilter, distanceFilter, ratingFilter, sortBy],
    queryFn: () => getPublicCircuits({ 
      searchTerm, 
      duration: durationFilter, 
      distance: distanceFilter, 
      rating: ratingFilter, 
      sortBy 
    }),
  });

  if (isLoading) return <div className="grid place-items-center">Loading...</div>;
  if (isError) return <div className="text-red-500">Error fetching circuits</div>;

  return (
    <div className="p-4">
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        duration={durationFilter}
        onDurationChange={setDurationFilter}
        distance={distanceFilter}
        onDistanceChange={setDistanceFilter}
        rating={ratingFilter}
        onRatingChange={setRatingFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {circuits?.map((circuit) => (
          <CircuitCard
            key={circuit.circuit_id}
            title={circuit.name}
            description={circuit.description}
            image={circuit.city_image}
            duration={circuit.estimated_duration}
            distance={circuit.distance}
            creator={circuit.creator_name!}
            creator_avatar={circuit.creator_avatar}
            city={circuit.city}
            country={circuit.country}
            rating={Number(circuit.rating)}
          />
        ))}
      </div>
    </div>
  );
}