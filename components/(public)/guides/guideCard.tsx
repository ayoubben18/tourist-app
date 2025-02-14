import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { ROUTES } from "@/routes";
import { GuideDTO } from "@/dto/guides-dto";

interface GuideCardProps {
  guide: GuideDTO;
}

export function GuideCard({ guide }: GuideCardProps) {
  const router = useRouter();

  return (
    <Card className="hover:shadow-lg transition-all duration-300 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
      <CardHeader className="flex flex-row items-center space-x-4 p-0">
        <Avatar className="w-14 h-14">
          <AvatarImage src={guide.avatar_url ?? ""} alt={guide.full_name ?? "Guide"} />
          <AvatarFallback>{guide.full_name?.charAt(0).toUpperCase() ?? "G"}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg font-semibold">{guide.full_name}</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {guide.years_of_experience
              ? `${guide.years_of_experience} years of experience`
              : "Experience not available"}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-yellow-500 ">
            <Star className="w-5 h-5 fill-yellow-500" />
            <span className="ml-1 text-sm font-medium">
              {guide.rating ?? "No rating"}
            </span>
          </div>
          <p className="text-sm font-semibold">
            {guide.price_per_hour ? `${guide.price_per_hour}DHS/hr` : "Price not set"}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          className="w-full"
          onClick={() => router.push(`${ROUTES.public.guides}/${guide.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
