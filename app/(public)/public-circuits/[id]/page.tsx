"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  Heart,
  Bookmark,
  MessageCircle,
  Clock,
  MapPin,
  Timer,
  Flag,
} from "lucide-react";
import { Place } from "@/components/shared/Maps";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import { getCircuitWithPOI } from "@/services/database/circuits";

// Dynamically import the Map component with SSR disabled
const Map = dynamic(() => import("@/components/shared/Maps"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
      Loading map...
    </div>
  ),
});

const comments = [
  {
    author: "Travel Enthusiast",
    content: "This is a perfect route to see the best of Paris in one day!",
    date: "2 days ago",
    avatarUrl: "https://i.pravatar.cc/150?img=1", // Random avatar URL
  },
  {
    author: "Paris Explorer",
    content:
      "I would recommend starting early to avoid crowds at the Eiffel Tower.",
    date: "1 week ago",
    avatarUrl: "https://i.pravatar.cc/150?img=2", // Random avatar URL
  },
];

export default function App() {
  const { id } = useParams();
  const circuit_id = id?.toString();
  const {
    data: circuitWithPOI,
    isLoading,
    isError,
  } = useQuery({
    queryKey: useQueryCacheKeys.circuitWithPOI(Number(circuit_id)),
    queryFn: () => getCircuitWithPOI({ circuit_id: circuit_id! }),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !circuitWithPOI) {
    return <div>Error loading circuit data</div>;
  }
  return (
    <div className="w-full min-h-screen bg-background p-6">
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Creator info */}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">Created by:</span>
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                circuitWithPOI.creator_avatar ??
                "https://i.pinimg.com/1200x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"
              }
              alt={circuitWithPOI.creator!}
            />
            <AvatarFallback>{circuitWithPOI.creator}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{circuitWithPOI.creator}</span>
        </div>

        {/* Circuit title and description */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{circuitWithPOI.name}</h1>
          <p className="text-muted-foreground">{circuitWithPOI.description}</p>
        </div>

        <div className="w-full h-[400px] rounded-lg overflow-hidden border">
          {circuitWithPOI.pois.length > 0 && (
            <Map
              places={circuitWithPOI.pois
                .filter((poi) => poi.coordinates !== null) // Filter out POIs with null coordinates
                .map((poi) => ({
                  name: poi.name,
                  description: poi.description || "",
                  estimated_duration: poi.estimated_duration!,
                  opening_hours: poi.opening_hours || "",
                  category: poi.category,
                  coordinates: poi.coordinates as [number, number], // Type assertion since we filtered out null
                }))}
            />
          )}
        </div>

        {/* Places section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Places to Visit
          </h2>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
            {circuitWithPOI.pois.map((poi, index) => (
              <div key={index} className="relative pl-16 pb-4">
                <div className="absolute left-4 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <div className="p-4 rounded-lg border hover:shadow-sm transition-shadow bg-background">
                  <div className="flex items-start flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{poi.name}</h3>
                      <p className="text-muted-foreground">{poi.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        {poi.estimated_duration} min
                      </div>
                      <div className="flex items-center gap-2 max-w-1/3">
                        <Flag className="w-4 h-4" />
                        {poi.category}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium">
            Take this Trip
          </button>
          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg hover:bg-muted">
              <Heart className="w-5 h-5" />
              Like
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg hover:bg-muted">
              <Bookmark className="w-5 h-5" />
              Add to Favorites
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-2xl font-semibold">Comments</h2>
          </div>
          {comments.map((comment, index) => (
            <div key={index} className="p-4 rounded-lg border">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 rounded-full">
                    <AvatarImage
                      src={comment.avatarUrl}
                      alt={comment.author}
                      className="h-12 w-12 rounded-full"
                    />
                    <AvatarFallback className="rounded-full">
                      {comment.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-medium">{comment.author}</h4>
                </div>
                <span className="text-sm text-muted-foreground">
                  {comment.date}
                </span>
              </div>
              <p className="mt-2 text-muted-foreground pl-11">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
