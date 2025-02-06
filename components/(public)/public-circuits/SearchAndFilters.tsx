"use client"
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SearchAndFilters() {
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [rating, setRating] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  return (
    <div className="space-y-4 mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          type="search" 
          placeholder="Search routes..." 
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-2">1-2 hours</SelectItem>
            <SelectItem value="2-4">2-4 hours</SelectItem>
            <SelectItem value="4-8">4-8 hours</SelectItem>
            <SelectItem value="8+">8+ hours</SelectItem>
          </SelectContent>
        </Select>

        <Select value={distance} onValueChange={setDistance}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Distance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-5">0-5 km</SelectItem>
            <SelectItem value="5-10">5-10 km</SelectItem>
            <SelectItem value="10-20">10-20 km</SelectItem>
            <SelectItem value="20+">20+ km</SelectItem>
          </SelectContent>
        </Select>

        <Select value={rating} onValueChange={setRating}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4+">4+ stars</SelectItem>
            <SelectItem value="3+">3+ stars</SelectItem>
            <SelectItem value="2+">2+ stars</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
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

export default SearchAndFilters;