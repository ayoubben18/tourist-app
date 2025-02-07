import React from "react";
import { Clock, MapPin, Route, Star, User } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Circuit } from "@/db/migrations/schema";

interface CircuitCardProps {
  circuit : Circuit
}

export function CircuitCard({
  circuit : { name,
  description,
  image,
  duration,
  distance,
  creator,
  creator_avatar,
  city,
  country,
  rating}
}: CircuitCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="aspect-[16/9] relative overflow-hidden rounded-t-lg">
          <img src={image} alt={title} className="object-cover w-full h-full" />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg font-semibold mb-2 mt-1">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </CardDescription>
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="w-10 h-10">
            <AvatarImage src={creator_avatar || undefined} alt={creator} />
            <AvatarFallback>
              <User className="w-3 h-3" />
            </AvatarFallback>
          </Avatar>
          <span>{creator}</span>
        </div>
        <div className="flex items-center gap-1 mb-1 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>
            {city}, {country}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Route className="w-4 h-4" />
            <span>{distance}</span>
          </div>
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  );
}
