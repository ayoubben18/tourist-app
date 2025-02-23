// components/booking-card.tsx

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CalendarDays,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  Timer,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingCardProps {
  status: "pending" | "confirmed";
  creator: string;
  creatorAvatar: string | null;
  formattedDuration: string;
  formattedDate: string;
  totalPrice: string | null;
  bookingId: number;
  circuit_id: number;
  onAccept?: (bookingId: number) => void;
  onReject?: (bookingId: number) => void;
}

export const BookingCard = ({
  status,
  creator,
  creatorAvatar,
  formattedDuration,
  formattedDate,
  totalPrice,
  bookingId,
  circuit_id,
  onAccept,
  onReject,
}: BookingCardProps) => {
  const router = useRouter();
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col h-full">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={
                creatorAvatar ||
                "https://i.pinimg.com/1200x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"
              }
              alt={creator}
            />
            <AvatarFallback>{creator[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{creator}</h3>
              {status === "pending" ? (
                <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 ">
                  Pending
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800 hover:gb-green-100">
                  Confirmed
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <Timer className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              {formattedDuration}
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <CircleDollarSign className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              {totalPrice ? `${totalPrice} DHS` : "Price not available"}
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 col-span-2">
            <CalendarDays className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
            onClick={() => router.push(`/public-circuits/${circuit_id}`)}
          >
            <Eye className="h-4 w-4" />
            View Circuit Details
          </Button>
          {status === "pending" && (
            <div className="flex gap-1 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() => onAccept?.(bookingId)}
                className="flex items-center gap-1 w-full sm:w-auto"
              >
                <CheckCircle2 className="h-3 w-3" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject?.(bookingId)}
                className="flex items-center gap-1 w-full sm:w-auto"
              >
                <XCircle className="h-3 w-3" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
